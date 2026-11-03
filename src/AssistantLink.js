import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { WordMageContext } from './WordMageContext';
import { GOOGLE_CONFIG } from './config';
import { linkRequest, loadGoogleIdentity } from './utils/assistant-link';

export default function AssistantLink() {
    const { authUser } = useContext(WordMageContext);
    const [state, setState] = useState('intro');
    const [message, setMessage] = useState('');
    const [code, setCode] = useState('');
    const [details, setDetails] = useState(null);
    const button = useRef(null);
    const session = useRef({ generation: 0 });
    const retry = useRef(null);
    const heading = useRef(null);

    function clear(cancel = false) {
        const old = session.current;
        clearTimeout(old.timer);
        clearTimeout(old.expiry);
        clearTimeout(old.requestTimeout);
        old.controller?.abort();
        session.current = { generation: old.generation + 1 };
        retry.current = null;
        const browserToken = old.browserToken;
        delete old.browserToken;
        delete old.googleToken;
        if (cancel && browserToken) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            linkRequest('cancel', { browser_token: browserToken }, controller.signal)
                .catch(() => {}).finally(() => clearTimeout(timeout));
        }
    }

    useEffect(() => {
        setState('intro'); setCode(''); setDetails(null); setMessage('');
        return () => clear(true);
    }, [authUser]);

    useEffect(() => { heading.current?.focus(); }, [state]);

    function expire() {
        clear(); setCode(''); setDetails(null);
        setMessage('This linking session has expired or is no longer available. If a confirmation response was lost, test Favorites in your assistant or start again.');
        setState('expired');
    }

    function fail(error, operation) {
        if (error.name === 'AbortError') return;
        clearTimeout(session.current.timer);
        const status = error.status;
        if (status === 410) { expire(); return; }
        if (status === 401) {
            session.current.googleToken = null;
            session.current.resume = operation;
            setMessage('Verify Google identity again using the same Google account that started this session.');
            setState('verifying'); return;
        }
        const temporary = !status || status === 503;
        retry.current = temporary && (session.current.retries || 0) < 3 ? operation : null;
        setMessage(status === 409
            ? 'This code is already claimed or this connection belongs to another account. Cancel and start again.'
            : temporary ? 'The connection is temporarily unavailable. You can retry up to three times while the code is valid.'
                : 'The linking request could not be completed. Cancel and start again.');
        setState('error');
    }

    async function request(action, body, operation) {
        const current = session.current;
        if (current.deadline && Date.now() >= current.deadline) { expire(); return; }
        current.controller = new AbortController();
        const timeout = setTimeout(() => current.controller.abort(), 15000);
        current.requestTimeout = timeout;
        try {
            const data = await linkRequest(action, body, current.controller.signal);
            if (session.current !== current) return;
            if (current.deadline && Date.now() >= current.deadline) { expire(); return; }
            return data;
        } catch (error) {
            if (session.current === current) {
                // A request timeout is recoverable; cancellation invalidates the session instead.
                fail(error.name === 'AbortError' ? new Error('Request timed out') : error, operation);
            }
        } finally { clearTimeout(timeout); }
    }

    async function poll() {
        const data = await request('status', { browser_token: session.current.browserToken }, poll);
        if (!data) return;
        if (data.success !== true || typeof data.claimed !== 'boolean') { fail(new Error('Invalid status'), poll); return; }
        if (data.claimed) {
            if (typeof data.issuer !== 'string' || typeof data.subject !== 'string') {
                fail(new Error('Invalid connection details'), poll); return;
            }
            setDetails({ issuer: data.issuer, subject: data.subject });
            setState('confirmation');
        } else {
            setState('waiting');
            session.current.timer = setTimeout(poll, 2000);
        }
    }

    async function start() {
        const data = await request('start', { google_id_token: session.current.googleToken }, start);
        if (!data) return;
        if (data.success !== true || !/^[a-f0-9]{64}$/i.test(data.browser_token || '') ||
            !/^[a-f0-9]{32}$/i.test(data.link_code || '') ||
            !Number.isFinite(data.expires_in) || data.expires_in <= 0) {
            fail(new Error('Invalid start response'), start); return;
        }
        session.current.browserToken = data.browser_token;
        session.current.deadline = Date.now() + Math.min(data.expires_in, 300) * 1000;
        session.current.expiry = setTimeout(expire, Math.min(data.expires_in, 300) * 1000);
        setCode(data.link_code); setMessage(''); setState('waiting');
        session.current.timer = setTimeout(poll, 2000);
    }

    async function confirm() {
        if (session.current.busy) return;
        if (!session.current.googleToken || Date.now() - session.current.googleTime > 240000) {
            session.current.resume = confirm; setState('verifying'); return;
        }
        session.current.busy = true;
        setState('confirming');
        const current = session.current;
        const data = await request('confirm', {
            browser_token: current.browserToken, google_id_token: current.googleToken, confirm: true
        }, confirm);
        if (session.current !== current) return;
        current.busy = false;
        if (!data) return;
        if (data.success !== true || data.linked !== true) { fail(new Error('Invalid confirmation'), confirm); return; }
        clear(); setCode(''); setDetails(null); setMessage(''); setState('success');
    }

    useEffect(() => {
        if (state !== 'verifying') return;
        let cancelled = false;
        const current = session.current;
        const loader = new AbortController();
        loadGoogleIdentity(loader.signal).then(google => {
            if (cancelled || session.current !== current) return;
            if (!GOOGLE_CONFIG.googleClientId) throw new Error('Google is not configured');
            google.initialize({ client_id: GOOGLE_CONFIG.googleClientId, auto_select: false,
                callback: response => {
                    if (cancelled || session.current !== current || current.identityBusy) return;
                    if (typeof response?.credential !== 'string' || !response.credential) {
                        setMessage('Google did not return a valid identity. Please try again.'); return;
                    }
                    current.identityBusy = true;
                    current.googleToken = response.credential;
                    current.googleTime = Date.now();
                    const next = current.resume || start;
                    current.resume = null;
                    setState('starting'); next();
                }
            });
            google.renderButton(button.current, { theme: 'outline', size: 'large' });
        }).catch(() => {
            if (!cancelled && session.current === current) {
                setMessage('Google verification is unavailable. Cancel and try again later.'); setState('error');
            }
        });
        return () => { cancelled = true; loader.abort(); current.identityBusy = false; };
        // Session operations read refs; never reinitialize Google on unrelated renders.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    function begin() {
        clear(true); setCode(''); setDetails(null); setMessage(''); setState('verifying');
    }
    function cancel() {
        clear(true); setCode(''); setDetails(null); setMessage('Connection cancelled. You can start again.'); setState('intro');
    }

    if (!authUser) return <div className="plain-content"><p>Sign in to WordMage to connect an AI assistant.</p><Link to="/login">Sign in</Link></div>;
    return <section className="plain-content assistant-link" aria-labelledby="assistant-link-title">
        <h1 id="assistant-link-title" ref={heading} tabIndex={-1}>{state === 'confirmation' || state === 'confirming' ? 'Confirm assistant connection' : 'Connect an AI assistant'}</h1>
        <p>WordMage account: {authUser.name || authUser.email}{authUser.name && authUser.email ? ` (${authUser.email})` : ''}</p>
        <div role="status" aria-live="polite">
            {state === 'intro' && <><p>Connect WordMage to your AI assistant to access your albums and Favorites.</p><p>First connect the WordMage integration using OAuth in your assistant. Shared or static credentials cannot link personal accounts. This screen pairs an existing OAuth connection; it does not install an integration.</p></>}
            {state === 'verifying' && <p>Verify your Google identity to continue. Choose the Google account you use for WordMage, and use that same account throughout this session.</p>}
            {state === 'starting' && <p>Preparing your connection…</p>}
            {state === 'waiting' && <><p>Send this code to your own assistant with the WordMage integration selected or enabled. The code expires within five minutes.</p><p><strong>{code}</strong></p></>}
            {(state === 'confirmation' || state === 'confirming') && <><p>This connection will be able to access your WordMage albums and Favorites. Continue only if you sent this code to your own AI assistant.</p><p>Connection issuer: {details?.issuer}<br />Connection subject: {details?.subject}</p>{state === 'confirming' && <p>Confirming connection…</p>}</>}
            {state === 'success' && <p>Your WordMage account is connected. Ask your assistant to list your Favorites.</p>}
            {message && <p>{message}</p>}
        </div>
        {state === 'verifying' && <div ref={button} />}
        <div className="assistant-link-actions">
            {(state === 'intro' || state === 'expired') && <button className="btn" onClick={begin}>{state === 'expired' ? 'Start again' : 'Verify with Google'}</button>}
            {state === 'waiting' && <button className="btn" onClick={async () => {
                const current = session.current;
                try {
                    await navigator.clipboard.writeText(`Link my WordMage account using this code: ${code}`);
                    if (session.current === current) setMessage('Instruction copied. Paste it into your own assistant.');
                } catch { if (session.current === current) setMessage('Copy unavailable. Type the code into your assistant.'); }
            }}>Copy instruction</button>}
            {state === 'confirmation' && <button className="btn" onClick={confirm}>Confirm connection</button>}
            {state === 'error' && retry.current && <button className="btn" onClick={() => {
                const operation = retry.current; retry.current = null;
                session.current.retries = (session.current.retries || 0) + 1;
                setMessage(''); setState('starting'); operation();
            }}>Retry</button>}
            {!['intro', 'expired', 'success'].includes(state) && <button className="btn btn-default" onClick={cancel}>Cancel</button>}
            <Link to="/settings">Back to Settings</Link>
        </div>
    </section>;
}
