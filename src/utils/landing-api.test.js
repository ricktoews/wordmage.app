import { getLandingPageWords } from './api';
import { authFetch } from './auth';
jest.mock('./auth', () => ({ authFetch: jest.fn() }));
test('landing selection uses the existing authenticated POST helper with the new API payload', async () => {
    authFetch.mockResolvedValue({ ok: true, json: async () => ({ success: true, page: 'rare', words: [] }) });
    await getLandingPageWords('rare');
    expect(authFetch).toHaveBeenCalledWith('https://wordmage.toews-api.com/get-landing-page-words', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: 'rare', count: 20 })
    });
    authFetch.mockResolvedValue({ ok: false, status: 503 });
    await expect(getLandingPageWords('gothic')).rejects.toThrow('503');
});
