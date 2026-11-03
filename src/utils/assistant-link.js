import { CONFIG } from '../config';

// Deliberately bypass authFetch: linking never changes or forwards the app token.
export async function linkRequest(action, body, signal) {
    const response = await fetch(`${CONFIG.domain}/oauth/link/${action}`, {
        method: 'POST', cache: 'no-store', signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const error = new Error('Unable to complete account linking.');
        error.status = response.status;
        throw error;
    }
    const data = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid linking response.');
    return data;
}

export function loadGoogleIdentity(signal) {
    if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
    return new Promise((resolve, reject) => {
        let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        const finish = (error) => {
            clearTimeout(timeout);
            script.removeEventListener('load', loaded);
            script.removeEventListener('error', failed);
            signal?.removeEventListener('abort', aborted);
            if (error) reject(error); else resolve(window.google.accounts.id);
        };
        const loaded = () => finish(window.google?.accounts?.id ? null : new Error('Google unavailable'));
        const failed = () => finish(new Error('Google unavailable'));
        const aborted = () => finish(new Error('Cancelled'));
        if (!script) {
            script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            document.head.appendChild(script);
        }
        const timeout = setTimeout(failed, 15000);
        script.addEventListener('load', loaded, { once: true });
        script.addEventListener('error', failed, { once: true });
        signal?.addEventListener('abort', aborted, { once: true });
        if (signal?.aborted) aborted();
    });
}
