import React, { useContext, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { WordMageContext } from './WordMageContext';
import { GOOGLE_CONFIG, CONFIG } from './config';
import WordsInterface from './utils/words-interface';

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve());
            if (existing.loaded) resolve();
            return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.defer = true;
        s.onload = () => { s.loaded = true; resolve(); };
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

function Login() {
    const history = useHistory();
    const { setAuthUser } = useContext(WordMageContext) || {};
    const buttonRef = useRef(null);

    // If redirected back from the server-side Google auth flow, the
    // Netlify function adds a `google_user` query param containing a
    // base64-encoded JSON payload. Mirror `Profile.js` behavior: parse it,
    // persist profile identifiers, fetch `/login` from the API with
    // `google: true` to retrieve custom data, initialize it, then
    // navigate to `/profile`.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const gu = params.get('google_user');
        if (!gu) return;

        (async () => {
            try {
                const decoded = JSON.parse(decodeURIComponent(atob(gu)));
                if (decoded && decoded.email) {
                    // Persist profile identifiers used elsewhere in the app
                    const providerId = decoded.provider_id || decoded.sub || decoded.id;
                    localStorage.setItem('wordmage-profile-user_id', providerId);
                    localStorage.setItem('wordmage-profile-email', decoded.email);

                    // Update client auth state
                    const user = { name: decoded.name || decoded.email, email: decoded.email, provider: 'google', id: providerId };
                    try { if (typeof setAuthUser === 'function') setAuthUser(user); } catch (e) { }

                    // Fetch custom data from backend (same as Profile.js)
                    try {
                        const resp = await fetch(`${CONFIG.domain}/login`, {
                            method: 'POST',
                            headers: { 'Content-type': 'application/json' },
                            body: JSON.stringify({ email: decoded.email, google: true })
                        });
                        const data = await resp.json();
                        if (data.custom) {
                            try {
                                WordsInterface.initializeCustom(JSON.parse(data.custom));
                            } catch (err) {
                                // if backend already returned parsed object
                                try { WordsInterface.initializeCustom(data.custom); } catch (e) { console.error('Failed to initialize custom data', e); }
                            }
                        }
                        if (data.user_id) {
                            localStorage.setItem('wordmage-profile-user_id', data.user_id);
                        }
                    } catch (err) {
                        console.error('Failed to load customizations after Google sign-in', err);
                    }

                    // Remove the query param and navigate to profile
                    params.delete('google_user');
                    const newUrl = '/profile' + (params.toString() ? ('?' + params.toString()) : '');
                    history.replace(newUrl);
                }
            } catch (err) {
                console.error('Failed to parse google_user payload in /login', err);
            }
        })();
    }, [history, setAuthUser]);

    // Handle Facebook OAuth callback
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const fu = params.get('facebook_user');
        if (!fu) return;

        (async () => {
            try {
                const decoded = JSON.parse(decodeURIComponent(atob(fu)));
                if (decoded && (decoded.email || decoded.provider_id)) {
                    // Persist profile identifiers used elsewhere in the app
                    const providerId = decoded.provider_id || decoded.id;
                    if (providerId) {
                        localStorage.setItem('wordmage-profile-user_id', providerId);
                    }
                    if (decoded.email) {
                        localStorage.setItem('wordmage-profile-email', decoded.email);
                    }

                    // Update client auth state
                    const user = {
                        name: decoded.name || decoded.email || 'Facebook User',
                        email: decoded.email || '',
                        provider: 'facebook',
                        id: providerId,
                        picture: decoded.picture
                    };
                    try { if (typeof setAuthUser === 'function') setAuthUser(user); } catch (e) { }

                    // Fetch custom data from backend if email is available
                    if (decoded.email) {
                        try {
                            const resp = await fetch(`${CONFIG.domain}/login`, {
                                method: 'POST',
                                headers: { 'Content-type': 'application/json' },
                                body: JSON.stringify({ email: decoded.email, facebook: true })
                            });
                            const data = await resp.json();
                            if (data.custom) {
                                try {
                                    WordsInterface.initializeCustom(JSON.parse(data.custom));
                                } catch (err) {
                                    // if backend already returned parsed object
                                    try { WordsInterface.initializeCustom(data.custom); } catch (e) { console.error('Failed to initialize custom data', e); }
                                }
                            }
                            if (data.user_id) {
                                localStorage.setItem('wordmage-profile-user_id', data.user_id);
                            }
                        } catch (err) {
                            console.error('Failed to load customizations after Facebook sign-in', err);
                        }
                    }

                    // Remove the query param and navigate to profile
                    params.delete('facebook_user');
                    const newUrl = '/profile' + (params.toString() ? ('?' + params.toString()) : '');
                    history.replace(newUrl);
                }
            } catch (err) {
                console.error('Failed to parse facebook_user payload in /login', err);
            }
        })();
    }, [history, setAuthUser]);

    useEffect(() => {
        const clientId = GOOGLE_CONFIG.googleClientId;
        if (!clientId) return; // no client id configured

        let cancelled = false;
        loadScript('https://accounts.google.com/gsi/client').then(() => {
            if (cancelled) return;
            if (!window.google || !window.google.accounts || !window.google.accounts.id) {
                console.warn('GSI script loaded but google.accounts.id not available');
                return;
            }

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse,
                auto_select: false
            });

            // Render the button into our placeholder
            try {
                window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large' });
                // Optionally, show the One Tap prompt
                // window.google.accounts.id.prompt();
            } catch (err) {
                console.warn('Error rendering GSI button', err);
            }
        }).catch(err => {
            console.error('Error loading GSI client', err);
        });

        return () => { cancelled = true; };
    }, [setAuthUser]);

    const getMyWords = () => {
        var tmpCustom = WordsInterface.getCustom();
        var liked = tmpCustom.filter(item => item.learn).sort((a, b) => a.word < b.word ? -1 : 1);
        return liked;
    };

    const setCustomData = custom => {
        try {
            var user_custom = typeof custom === 'string' ? JSON.parse(custom) : custom;
            WordsInterface.initializeCustom(user_custom);
        } catch (err) {
            console.error('Failed to parse/initialize custom data', err);
        }
    };


    const handleCredentialResponse = (response) => {
        if (!response || !response.credential) {
            console.warn('No credential returned');
            return;
        }
        const payload = parseJwt(response.credential);
        if (!payload) {
            console.warn('Could not parse ID token');
            return;
        }
        const user = {
            name: payload.name,
            email: payload.email,
            avatarUrl: payload.picture,
            provider: 'google',
            id: payload.sub,
            idToken: response.credential
        };
        try {
            localStorage.setItem('authUser', JSON.stringify(user));
        } catch (e) {
            console.warn('Could not persist authUser', e);
        }
        // Attempt to load the user's customizations from the server
        // by calling the same login endpoint used for email/password logins.
        // We send a `google: true` flag so the backend can treat this as
        // an OAuth-based lookup. Backend must support this behavior; if it
        // doesn't, you'll need to add a server endpoint that returns custom
        // data for the provided email when authenticated via Google.
        (async () => {
            try {
                const resp = await fetch(`${CONFIG.domain}/login`, {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify({ email: payload.email, google: true })
                });
                const data = await resp.json();
                if (data.custom) {
                    setCustomData(data.custom);
                    console.log('Signed in with Google — customizations loaded');
                } else {
                    console.log('Signed in with Google');
                }
                if (data.user_id) {
                    // If backend returns a user_id, persist it for other pages
                    localStorage.setItem('wordmage-profile-user_id', data.user_id);
                }
            } catch (err) {
                console.error('Failed to load customizations after Google sign-in', err);
            }
        })();
        if (typeof setAuthUser === 'function') setAuthUser(user);
        history.push('/');
    };

    const clientId = GOOGLE_CONFIG.googleClientId;

    return (
        <>
            <div className="login-toolbar">
                <div className="page-title">Login</div>
            </div>
            <div className="plain-content login-content">
                <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
                {clientId ? (
                    <>
                        <div ref={buttonRef} />
                    </>
                ) : (
                    <>
                        <p>No Google Client ID configured. To enable real Google Sign-In, set `GOOGLE_CONFIG.googleClientId` in `src/config.js` to your OAuth client ID.</p>
                        <div style={{ marginTop: 12 }}>
                            <button className={'google-signin-btn btn'} onClick={() => { window.location.href = '/.netlify/functions/auth-google'; }}>
                                <img src="/icons/google.svg" alt="" style={{ height: '18px', marginRight: '8px' }} /> Sign in with Google
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
        </>
    );
}

export default Login;
