import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Link } from 'react-router-dom';
import NewWords from './NewWords';
import { getNewWords } from '../utils/api';
jest.mock('../utils/api', () => ({ getNewWords: jest.fn() }));
jest.mock('./WordScroller', () => ({ pool, renderWordMetadata }) => <div>{pool.map(word => <div key={word.id}>{word.word} {word.def}{renderWordMetadata(word)}</div>)}</div>);
beforeEach(() => jest.clearAllMocks());

test('opens public New Words route, displays acceptance date unchanged and loads additional pages', async () => {
    getNewWords.mockResolvedValueOnce({ words: [{ id: 1, word: 'first', def: 'definition one', accepted_at: '2026-10-30 12:34:56' }], pagination: { limit: 50, offset: 0, total: 51, has_more: true } })
        .mockResolvedValueOnce({ words: [{ id: 2, word: 'second', def: 'definition two', accepted_at: '2026-10-29 10:00:00' }], pagination: { limit: 50, offset: 50, total: 51, has_more: false } });
    render(<MemoryRouter><Link to="/new-words">New Words</Link><Route path="/new-words"><NewWords /></Route></MemoryRouter>);
    fireEvent.click(screen.getByRole('link', { name: 'New Words' }));
    await screen.findByText('2026-10-30 12:34:56');
    expect(getNewWords).toHaveBeenCalledWith({ limit: 50, offset: 0 });
    fireEvent.click(screen.getByText('Load More'));
    await screen.findByText('2026-10-29 10:00:00');
    expect(getNewWords).toHaveBeenLastCalledWith({ limit: 50, offset: 50 });
    expect(screen.queryByText('Load More')).not.toBeInTheDocument();
    expect(screen.getByText(/first definition one/)).toBeInTheDocument();
});

test('allows retry after load failure', async () => {
    getNewWords.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ words: [], pagination: { has_more: false } });
    render(<NewWords />);
    await screen.findByRole('alert');
    fireEvent.click(screen.getByText('Try again'));
    await screen.findByText('No new words yet.');
});

test('applies the saved theme and responds to theme changes', async () => {
    getNewWords.mockResolvedValue({ words: [], pagination: { has_more: false } });
    localStorage.setItem('wordmage.albumTheme', 'obsidian');
    try {
        render(<NewWords />);
        await screen.findByText('No new words yet.');
        // Theme classes live on the page wrapper.
        // eslint-disable-next-line testing-library/no-node-access
        const page = screen.getByText('New Words').closest('.album-content-page');
        expect(page).toHaveClass('album-theme-obsidian');
        fireEvent(window, new CustomEvent('wordmage:albumThemeChanged', { detail: { theme: 'paper' } }));
        expect(page).toHaveClass('album-theme-paper');
        localStorage.setItem('wordmage.albumTheme', 'fogbound');
        fireEvent(window, new StorageEvent('storage', { key: 'wordmage.albumTheme' }));
        expect(page).toHaveClass('album-theme-fogbound');
        localStorage.setItem('wordmage.albumTheme', 'invalid');
        fireEvent(window, new StorageEvent('storage', { key: 'wordmage.albumTheme' }));
        expect(page).toHaveClass('album-theme-classic');
    } finally {
        localStorage.removeItem('wordmage.albumTheme');
    }
});
