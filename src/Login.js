import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { WordMageContext } from './WordMageContext';
import { GOOGLE_CONFIG, CONFIG } from './config';
import WordsInterface from './utils/words-interface';
import { persistTokenFromResponse } from './utils/auth';
import {
    claimAnonymousAlbums,
    clearAnonymousWorkspace,
    clearPendingAlbumClaim,
    getAnonymousAlbumsForClaim,
    getPendingAlbumClaim,
    loadUserWorkspace,
    savePendingAlbumClaim,
} from './utils/workspace';
import Popup from './components/Popup';
import PopupHeader from './components/Popup-Header';

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

const ALBUM_THEMES = ['classic', 'paper', 'ink', 'arcane', 'eldritch', 'obsidian', 'fogbound'];
const normalizeAlbumId = (albumId) => String(albumId);
const getStoredAlbumTheme = () => {
    const savedTheme = localStorage.getItem('wordmage.albumTheme');
    return ALBUM_THEMES.includes(savedTheme) ? savedTheme : 'classic';
};

function Login() {
    const history = useHistory();
    const { setAuthUser } = useContext(WordMageContext) || {};
    const buttonRef = useRef(null);
    const [claimPrompt, setClaimPrompt] = useState(null);
    const [selectedClaimAlbumIds, setSelectedClaimAlbumIds] = useState([]);
    const [isClaimingAlbums, setIsClaimingAlbums] = useState(false);

    const emitWorkspaceChanged = useCallback((userId) => {
        window.dispatchEvent(new CustomEvent('wordmage:workspaceChanged', {
            detail: { userId: String(userId) }
        }));
    }, []);

    const loadAuthenticatedWorkspace = useCallback(async (userId, redirectPath = '/') => {
        await loadUserWorkspace(userId);
        emitWorkspaceChanged(userId);
        history.push(redirectPath);
    }, [emitWorkspaceChanged, history]);

    const showAlbumClaimPrompt = useCallback((claimContext) => {
        const selectedAlbumIds = (claimContext.selectedAlbumIds || claimContext.albums.map((album) => album.id))
            .map(normalizeAlbumId);
        setSelectedClaimAlbumIds(selectedAlbumIds);
        setClaimPrompt({
            ...claimContext,
            selectedAlbumIds
        });
    }, []);

    const maybePromptToClaimAnonymousAlbums = useCallback(async ({ data, redirectPath = '/' }) => {
        if (!data?.user_id) {
            return false;
        }

        const claimContext = await getAnonymousAlbumsForClaim().catch((error) => {
            console.error('Failed to inspect anonymous albums:', error);
            return null;
        });

        persistTokenFromResponse(data);
        localStorage.setItem('wordmage-profile-user_id', data.user_id);

        if (!claimContext?.albums?.length) {
            clearAnonymousWorkspace();
            await loadAuthenticatedWorkspace(data.user_id, redirectPath);
            return false;
        }

        const pendingClaim = {
            ...claimContext,
            authenticatedUserId: data.user_id,
            redirectPath,
            selectedAlbumIds: claimContext.albums.map((album) => normalizeAlbumId(album.id))
        };
        savePendingAlbumClaim(pendingClaim);
        showAlbumClaimPrompt(pendingClaim);
        return true;
    }, [loadAuthenticatedWorkspace, showAlbumClaimPrompt]);

    const handleClaimAlbumToggle = (albumId) => {
        const normalizedAlbumId = normalizeAlbumId(albumId);

        setSelectedClaimAlbumIds((currentAlbumIds) => {
            const currentAlbumIdSet = new Set(currentAlbumIds.map(normalizeAlbumId));
            if (currentAlbumIdSet.has(normalizedAlbumId)) {
                currentAlbumIdSet.delete(normalizedAlbumId);
            } else {
                currentAlbumIdSet.add(normalizedAlbumId);
            }
            const nextAlbumIds = Array.from(currentAlbumIdSet);

            if (claimPrompt) {
                const nextClaimPrompt = {
                    ...claimPrompt,
                    selectedAlbumIds: nextAlbumIds
                };
                savePendingAlbumClaim(nextClaimPrompt);
                setClaimPrompt(nextClaimPrompt);
            }

            return nextAlbumIds;
        });
    };

    const finishClaimFlow = async ({ shouldClaim }) => {
        if (!claimPrompt) {
            return;
        }

        setIsClaimingAlbums(true);
        try {
            await claimAnonymousAlbums({
                anonymousUserId: claimPrompt.anonymousUserId,
                anonymousToken: claimPrompt.anonymousToken,
                albumIds: shouldClaim
                    ? selectedClaimAlbumIds.map((albumId) => {
                        const numericAlbumId = Number(albumId);
                        return Number.isNaN(numericAlbumId) ? albumId : numericAlbumId;
                    })
                    : []
            });

            clearPendingAlbumClaim();
            clearAnonymousWorkspace();
            await loadAuthenticatedWorkspace(claimPrompt.authenticatedUserId, claimPrompt.redirectPath);
            setClaimPrompt(null);
        } catch (error) {
            console.error('Failed to preserve anonymous albums:', error);
            alert('Could not preserve those albums. Please try again, or choose Skip to continue.');
        } finally {
            setIsClaimingAlbums(false);
        }
    };

    useEffect(() => {
        const pendingClaim = getPendingAlbumClaim();
        if (
            pendingClaim?.authenticatedUserId &&
            pendingClaim?.anonymousUserId &&
            pendingClaim?.anonymousToken &&
            pendingClaim?.albums?.length
        ) {
            showAlbumClaimPrompt(pendingClaim);
        }
    }, [showAlbumClaimPrompt]);

    // If redirected back from the server-side Google auth flow, the
    // Netlify function adds a `google_user` query param containing a
    // base64-encoded JSON payload. Mirror `Profile.js` behavior: parse it,
    // persist profile identifiers, fetch `/login` from the API with
    // `google: true` to retrieve custom data, initialize it, then
    // navigate to settings.
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
                    try {
                        localStorage.setItem('authUser', JSON.stringify(user));
                        localStorage.setItem('wordmage.hasAuthenticatedBefore', 'true');
                    } catch (e) { }
                    try { if (typeof setAuthUser === 'function') setAuthUser(user); } catch (e) { }

                    // Fetch custom data from backend (same as Profile.js)
                    try {
                        const resp = await fetch(`${CONFIG.domain}/login`, {
                            method: 'POST',
                            headers: { 'Content-type': 'application/json' },
                            body: JSON.stringify({ email: decoded.email, google: true })
                        });
                        const data = await resp.json();
                        const didPrompt = await maybePromptToClaimAnonymousAlbums({ data, redirectPath: '/settings' });
                        if (data.user_id) {
                            if (didPrompt) {
                                params.delete('google_user');
                                history.replace('/login' + (params.toString() ? ('?' + params.toString()) : ''));
                                return;
                            }
                            return;
                        }
                        if (data.custom) {
                            try {
                                WordsInterface.initializeCustom(JSON.parse(data.custom));
                            } catch (err) {
                                // if backend already returned parsed object
                                try { WordsInterface.initializeCustom(data.custom); } catch (e) { console.error('Failed to initialize custom data', e); }
                            }
                        }
                    } catch (err) {
                        console.error('Failed to load customizations after Google sign-in', err);
                    }

                    // Remove the query param and navigate to profile
                    params.delete('google_user');
                    const newUrl = '/settings' + (params.toString() ? ('?' + params.toString()) : '');
                    history.replace(newUrl);
                }
            } catch (err) {
                console.error('Failed to parse google_user payload in /login', err);
            }
        })();
    }, [history, maybePromptToClaimAnonymousAlbums, setAuthUser]);

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
                    try {
                        localStorage.setItem('authUser', JSON.stringify(user));
                        localStorage.setItem('wordmage.hasAuthenticatedBefore', 'true');
                    } catch (e) { }
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
                            const didPrompt = await maybePromptToClaimAnonymousAlbums({ data, redirectPath: '/settings' });
                            if (data.user_id) {
                                if (didPrompt) {
                                    params.delete('facebook_user');
                                    history.replace('/login' + (params.toString() ? ('?' + params.toString()) : ''));
                                    return;
                                }
                                return;
                            }
                            if (data.custom) {
                                try {
                                    WordsInterface.initializeCustom(JSON.parse(data.custom));
                                } catch (err) {
                                    // if backend already returned parsed object
                                    try { WordsInterface.initializeCustom(data.custom); } catch (e) { console.error('Failed to initialize custom data', e); }
                                }
                            }
                        } catch (err) {
                            console.error('Failed to load customizations after Facebook sign-in', err);
                        }
                    }

                    // Remove the query param and navigate to profile
                    params.delete('facebook_user');
                    const newUrl = '/settings' + (params.toString() ? ('?' + params.toString()) : '');
                    history.replace(newUrl);
                }
            } catch (err) {
                console.error('Failed to parse facebook_user payload in /login', err);
            }
        })();
    }, [history, maybePromptToClaimAnonymousAlbums, setAuthUser]);

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
            localStorage.setItem('wordmage.hasAuthenticatedBefore', 'true');
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
                const didPrompt = await maybePromptToClaimAnonymousAlbums({ data, redirectPath: '/' });
                if (data.user_id) {
                    if (didPrompt) {
                        return;
                    }
                    return;
                }
                if (data.custom) {
                    setCustomData(data.custom);
                    console.log('Signed in with Google — customizations loaded');
                } else {
                    console.log('Signed in with Google');
                }
            } catch (err) {
                console.error('Failed to load customizations after Google sign-in', err);
            }
        })();
        if (typeof setAuthUser === 'function') setAuthUser(user);
    };

    const clientId = GOOGLE_CONFIG.googleClientId;
    const claimPopupTheme = getStoredAlbumTheme();
    const claimAlbums = claimPrompt?.albums || [];
    const favoriteClaimAlbums = claimAlbums.filter((album) => album.title === 'Favorites');
    const otherClaimAlbums = claimAlbums.filter((album) => album.title !== 'Favorites');
    const renderClaimAlbumItem = (album) => {
        const albumId = normalizeAlbumId(album.id);

        return (
            <button
                key={album.id}
                type="button"
                className={`claim-album-item${selectedClaimAlbumIds.includes(albumId) ? ' selected' : ''}`}
                onClick={() => handleClaimAlbumToggle(album.id)}
                disabled={isClaimingAlbums}
                role="checkbox"
                aria-checked={selectedClaimAlbumIds.includes(albumId)}
            >
                <span className="claim-album-check" aria-hidden="true">✓</span>
                <span>{album.title}</span>
            </button>
        );
    };

    return (
        <>
            <Popup
                isVisible={!!claimPrompt}
                handleBackgroundClick={() => { }}
                className={`list-share-popup claim-albums-popup album-theme-${claimPopupTheme}`}
            >
                <PopupHeader>Keep words from this device?</PopupHeader>
                <div className="popup-body">
                    <div className="claim-albums-copy">
                        You used WordMage before signing in. Choose any local albums or favorites you would like to add to your signed-in account.
                    </div>
                    <div className="claim-albums-list">
                        {favoriteClaimAlbums.length > 0 && (
                            <div className="claim-albums-section">
                                <div className="claim-albums-section-title">Favorites</div>
                                {favoriteClaimAlbums.map(renderClaimAlbumItem)}
                            </div>
                        )}
                        {otherClaimAlbums.length > 0 && (
                            <div className="claim-albums-section">
                                <div className="claim-albums-section-title">Albums</div>
                                {otherClaimAlbums.map(renderClaimAlbumItem)}
                            </div>
                        )}
                    </div>
                    <div className="button-wrapper claim-albums-actions">
                        <button
                            type="button"
                            className="btn btn-default"
                            onClick={() => finishClaimFlow({ shouldClaim: false })}
                            disabled={isClaimingAlbums}
                        >
                            Skip
                        </button>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => finishClaimFlow({ shouldClaim: true })}
                            disabled={isClaimingAlbums}
                        >
                            Keep Selected
                        </button>
                    </div>
                </div>
            </Popup>
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
