import { acceptWords, rejectWords, getInboxWords, getNewWords } from './api';
beforeEach(() => {
    localStorage.setItem('wordmage-auth-token', 'test-token');
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ rejected_count: 1 }) });
});
afterEach(() => { localStorage.clear(); delete global.fetch; });
test.each([['accept', acceptWords], ['reject', rejectWords]])('%s uses authenticated POST with selected IDs', async (action, call) => {
    await call([10795, 10796]);
    expect(fetch).toHaveBeenCalledWith(`https://wordmage.toews-api.com/${action}-words`, expect.objectContaining({
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' }, body: JSON.stringify({ word_ids: [10795, 10796] })
    }));
});
test('refreshes inbox and retrieves public new words with pagination', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ words: [{ id: 1, definition: 'meaning' }] }) });
    expect(await getInboxWords()).toEqual([{ id: 1, definition: 'meaning', def: 'meaning' }]);
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ words: [], pagination: { has_more: false } }) });
    await getNewWords({ limit: 50, offset: 50 });
    expect(fetch).toHaveBeenLastCalledWith('https://wordmage.toews-api.com/new-words?limit=50&offset=50', expect.anything());
});

test('new words can be loaded without a Bearer token', async () => {
    localStorage.clear();
    fetch.mockResolvedValue({ ok: true, json: async () => ({ words: [], pagination: { has_more: false } }) });
    await getNewWords();
    expect(fetch.mock.calls[0][1].headers).toEqual({});
});

test('failed review response raises an error', async () => {
    fetch.mockResolvedValue({ ok: false, status: 403 });
    await expect(acceptWords([1])).rejects.toThrow('403');
});

test('Inbox puts null read status first, then newest added date within each group', async () => {
    const records = [
        { id: 1, inbox_read: 1, added: '2026-10-31 15:00:00' },
        { id: 2, inbox_read: null, added: '2026-10-29 10:00:00' },
        { id: 3, inbox_read: 0, added: '2026-10-30 10:00:00' },
        { id: 4, inbox_read: null, added: '2026-10-30 10:00:00' },
        { id: 5, inbox_read: null, added: '2026-10-30 11:00:00' }
    ];
    fetch.mockResolvedValue({ ok: true, json: async () => ({ words: records }) });
    expect((await getInboxWords()).map(word => word.id)).toEqual([5, 4, 2, 1, 3]);
    expect(records.map(word => word.id)).toEqual([1, 2, 3, 4, 5]);
});
