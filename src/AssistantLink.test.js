import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AssistantLink from './AssistantLink';
import { WordMageContext } from './WordMageContext';
import { linkRequest, loadGoogleIdentity } from './utils/assistant-link';

jest.mock('./utils/assistant-link');
jest.mock('./config', () => ({ GOOGLE_CONFIG: { googleClientId: 'existing-client' } }));
const code = 'a'.repeat(32);
const browser = 'b'.repeat(64);
let callback;
// Flush Google and clipboard promise callbacks before inspecting the UI.
// eslint-disable-next-line testing-library/no-unnecessary-act
const flush = async () => { await act(async () => {}); };
function mount() {
    return render(<MemoryRouter><WordMageContext.Provider value={{ authUser: { id: 'one', name: 'Reader', email: 'reader@example.com' } }}><AssistantLink /></WordMageContext.Provider></MemoryRouter>);
}
async function begin() {
    fireEvent.click(screen.getByText('Verify with Google'));
    await flush();
    await act(async () => callback({ credential: 'google-secret' }));
}
async function tick() { await act(async () => { jest.advanceTimersByTime(2000); }); }
beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    loadGoogleIdentity.mockResolvedValue({ initialize: options => { callback = options.callback; }, renderButton: jest.fn() });
    linkRequest.mockImplementation(async action => {
        if (action === 'start') return { success: true, browser_token: browser, link_code: code, expires_in: 300 };
        if (action === 'status') return { success: true, claimed: true, issuer: 'issuer', subject: 'subject' };
        return { success: true, linked: true };
    });
});
afterEach(() => { jest.useRealTimers(); });
test('claim requires explicit confirmation; only the code is copied and app credentials stay intact', async () => {
    localStorage.setItem('wordmage-auth-token', 'app-token');
    const storage = jest.spyOn(Storage.prototype, 'setItem');
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: jest.fn().mockResolvedValue() } });
    mount(); await begin();
    fireEvent.click(screen.getByText('Copy instruction')); await flush();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`Link my WordMage account using this code: ${code}`);
    await tick();
    expect(screen.getByText('Confirm connection')).toBeInTheDocument();
    expect(linkRequest.mock.calls.some(([action]) => action === 'confirm')).toBe(false);
    fireEvent.click(screen.getByText('Confirm connection'));
    fireEvent.click(screen.getByText('Confirming connection…'));
    await flush();
    expect(linkRequest.mock.calls.filter(([action]) => action === 'confirm')).toHaveLength(1);
    expect(screen.getByText(/Your WordMage account is connected/)).toBeInTheDocument();
    expect(localStorage.getItem('wordmage-auth-token')).toBe('app-token');
    expect(storage).not.toHaveBeenCalled(); storage.mockRestore();
});
test.each([400, 409, 410, 503])('handles %s without automatically retrying', async status => {
    linkRequest.mockRejectedValueOnce(Object.assign(new Error('private backend body'), { status }));
    mount(); await begin();
    expect(screen.queryByText('private backend body')).not.toBeInTheDocument();
    await tick(); expect(linkRequest).toHaveBeenCalledTimes(1);
    expect(screen.getByText(status === 410 ? 'Start again' : 'Cancel')).toBeInTheDocument();
});
test('401 re-verifies Google without discarding the browser session', async () => {
    mount(); await begin();
    linkRequest.mockRejectedValueOnce(Object.assign(new Error(), { status: 401 }));
    await tick(); await flush();
    await act(async () => callback({ credential: 'fresh-google-secret' }));
    expect(screen.getByText('Confirm connection')).toBeInTheDocument();
    expect(linkRequest.mock.calls.filter(([action]) => action === 'start')).toHaveLength(1);
});
test('cancel ignores a late status response and stops polling', async () => {
    mount(); await begin();
    let resolve;
    linkRequest.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    await tick();
    fireEvent.click(screen.getByText('Cancel'));
    await act(async () => resolve({ success: true, claimed: true, issuer: 'old', subject: 'old' }));
    expect(screen.queryByText('Confirm connection')).not.toBeInTheDocument();
    expect(linkRequest).toHaveBeenCalledWith('cancel', { browser_token: browser }, expect.anything());
    const count = linkRequest.mock.calls.length; await tick(); expect(linkRequest).toHaveBeenCalledTimes(count);
});
test('unmount aborts requests and cancels the session', async () => {
    const view = mount(); await begin();
    const signal = linkRequest.mock.calls[0][2];
    view.unmount(); expect(signal.aborted).toBe(true);
    expect(linkRequest).toHaveBeenLastCalledWith('cancel', { browser_token: browser }, expect.anything());
});
test('expiry clears the code and prevents further polling', async () => {
    mount(); await begin();
    await act(async () => { jest.advanceTimersByTime(300000); });
    expect(screen.getByText('Start again')).toBeInTheDocument();
    expect(screen.queryByText(code)).not.toBeInTheDocument();
});
test('polls sequentially and retries network failures only on user action', async () => {
    mount(); await begin();
    let reject;
    linkRequest.mockImplementationOnce(() => new Promise((_, fail) => { reject = fail; }));
    await tick(); await tick();
    expect(linkRequest.mock.calls.filter(([action]) => action === 'status')).toHaveLength(1);
    await act(async () => reject(new Error('network')));
    expect(screen.getByText('Retry')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Retry')); await flush();
    expect(screen.getByText('Confirm connection')).toBeInTheDocument();
});
test('a lost confirm response followed by 410 never claims success', async () => {
    mount(); await begin(); await tick();
    linkRequest.mockRejectedValueOnce(new Error('network'));
    fireEvent.click(screen.getByText('Confirm connection')); await flush();
    linkRequest.mockRejectedValueOnce(Object.assign(new Error(), { status: 410 }));
    fireEvent.click(screen.getByText('Retry')); await flush();
    expect(screen.queryByText(/Your WordMage account is connected/)).not.toBeInTheDocument();
    expect(screen.getByText(/test Favorites in your assistant/)).toBeInTheDocument();
});
test('old responses cannot replace a new session after restart', async () => {
    mount(); await begin();
    let resolve;
    linkRequest.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    await tick(); fireEvent.click(screen.getByText('Cancel')); await begin();
    await act(async () => resolve({ success: true, claimed: true, issuer: 'old', subject: 'old' }));
    expect(screen.queryByText('Confirm connection')).not.toBeInTheDocument();
    expect(screen.getByText('Copy instruction')).toBeInTheDocument();
});
