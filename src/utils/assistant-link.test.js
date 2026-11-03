import { linkRequest } from './assistant-link';

afterEach(() => { delete global.fetch; localStorage.clear(); });
test('JSON requests use the configured API and never forward or replace app authentication', async () => {
    localStorage.setItem('wordmage-auth-token', 'app-secret');
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    const signal = new AbortController().signal;
    await linkRequest('start', { google_id_token: 'google-secret' }, signal);
    expect(fetch).toHaveBeenCalledWith('https://wordmage.toews-api.com/oauth/link/start', {
        method: 'POST', cache: 'no-store', signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_id_token: 'google-secret' })
    });
    expect(localStorage.getItem('wordmage-auth-token')).toBe('app-secret');
});
test('failed requests discard server response bodies', async () => {
    const json = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 409, json });
    await expect(linkRequest('confirm', {})).rejects.toMatchObject({ status: 409, message: 'Unable to complete account linking.' });
    expect(json).not.toHaveBeenCalled();
});
