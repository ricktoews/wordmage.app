import { ensureActiveWorkspace, loadUserWorkspace } from './workspace';
import { authFetch } from './auth';

jest.mock('./auth', () => ({
    authFetch: jest.fn(), persistTokenFromResponse: jest.fn(), removeAnonymousToken: jest.fn()
}));
jest.mock('./words-interface', () => ({ initializeCustom: jest.fn(), setFavoriteWords: jest.fn() }));

beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    authFetch.mockResolvedValue({ json: async () => ({ album_ids: {} }) });
});

test.each(['/random', '/albums', '/', '/words/caf%C3%A9'])('marks startup at %s without changing the POST payload', async entryPath => {
    localStorage.setItem('wordmage-profile-user_id', '4');
    await ensureActiveWorkspace({ entryPath });
    const [url, options] = authFetch.mock.calls[0];
    expect(new URL(url).searchParams.get('entry')).toBe(entryPath);
    expect(options).toEqual({ method: 'POST', headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ user_id: '4' }) });
    expect(authFetch).toHaveBeenCalledTimes(1);
});

test('retains the captured entry while creating an anonymous workspace', async () => {
    window.history.replaceState({}, '', '/albums?campaign=test#section');
    const entryPath = window.location.pathname;
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation(async () => {
        window.history.replaceState({}, '', '/random');
        return { json: async () => ({ user_id: 99, anonymous_token: 'anonymous-test-token' }) };
    });
    try {
        await ensureActiveWorkspace({ entryPath });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(authFetch).toHaveBeenCalledWith(
            'https://wordmage.toews-api.com/loadcustom?entry=%2Falbums',
            expect.objectContaining({ body: JSON.stringify({ user_id: 99 }) })
        );
    } finally {
        global.fetch = originalFetch;
        window.history.replaceState({}, '', '/');
    }
});

test('later workspace loads do not become landings after route or account changes', async () => {
    await loadUserWorkspace('4', { entryPath: '/albums' });
    window.history.replaceState({}, '', '/random');
    await loadUserWorkspace('5');
    expect(authFetch.mock.calls.map(([url]) => url)).toEqual([
        'https://wordmage.toews-api.com/loadcustom?entry=%2Falbums',
        'https://wordmage.toews-api.com/loadcustom'
    ]);
    window.history.replaceState({}, '', '/');
});
