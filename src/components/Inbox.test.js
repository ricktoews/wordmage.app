import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Inbox from './Inbox';
import { acceptWords, rejectWords, getInboxWords, markInboxWordsRead } from '../utils/api';

jest.mock('../utils/api', () => ({ acceptWords: jest.fn(), rejectWords: jest.fn(), getInboxWords: jest.fn(), markInboxWordsRead: jest.fn() }));
jest.mock('./WordScroller', () => ({ pool, renderWordSelection }) => <div>{pool.map(word => <div key={word.id}>{renderWordSelection(word)}</div>)}</div>);
const words = [{ id: 1, word: 'one' }, { id: 2, word: 'two' }];
beforeEach(() => { jest.clearAllMocks(); markInboxWordsRead.mockResolvedValue(); });

function setup() {
    const onWordsRefreshed = jest.fn();
    const onMarkedRead = jest.fn();
    function Harness() {
        const [current, setCurrent] = useState(words);
        return <Inbox words={current} onWordsRefreshed={next => { onWordsRefreshed(next); setCurrent(next); }} onMarkedRead={onMarkedRead} />;
    }
    render(<Harness />);
    return { onWordsRefreshed, onMarkedRead };
}

test('selects multiple words, accepts and refreshes the Inbox', async () => {
    acceptWords.mockResolvedValue({ accepted_count: 2 }); getInboxWords.mockResolvedValue([]);
    const { onWordsRefreshed, onMarkedRead } = setup();
    expect(screen.queryByText('Select All')).not.toBeInTheDocument();
    expect(screen.queryByText(/^[0-9]+ selected$/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept selected' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reject selected' })).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Select one'));
    fireEvent.click(screen.getByLabelText('Select two'));
    fireEvent.click(screen.getByRole('button', { name: 'Accept selected' }));
    await waitFor(() => expect(onWordsRefreshed).toHaveBeenCalledWith([]));
    expect(acceptWords).toHaveBeenCalledWith([1, 2]);
    expect(onMarkedRead).toHaveBeenCalled();
});

test('confirms rejection and uses actual count and refreshed remaining words', async () => {
    rejectWords.mockResolvedValue({ rejected_count: 1 }); getInboxWords.mockResolvedValue([words[1]]);
    const { onWordsRefreshed } = setup();
    fireEvent.click(screen.getByLabelText('Select one')); fireEvent.click(screen.getByLabelText('Select two'));
    fireEvent.click(screen.getByRole('button', { name: 'Reject selected' }));
    expect(rejectWords).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Cancel'));
    expect(rejectWords).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Reject selected' }));
    fireEvent.click(screen.getByText('Confirm rejection'));
    await screen.findByText('1 word rejected.');
    await waitFor(() => expect(onWordsRefreshed).toHaveBeenCalledWith([words[1]]));
    expect(rejectWords).toHaveBeenCalledWith([1, 2]);
    expect(screen.queryByLabelText('Select one')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Select two')).toBeInTheDocument();
});

test('preserves selection on failure and disables controls during review', async () => {
    let reject;
    acceptWords.mockReturnValue(new Promise((_, fail) => { reject = fail; }));
    setup(); fireEvent.click(screen.getByLabelText('Select one')); fireEvent.click(screen.getByLabelText('Select two')); fireEvent.click(screen.getByRole('button', { name: 'Accept selected' }));
    expect(screen.getByRole('button', { name: 'Reject selected' })).toBeDisabled();
    reject(new Error('offline'));
    await screen.findByRole('alert');
    expect(getInboxWords).not.toHaveBeenCalled();
});

test('reports a refresh failure separately after a successful review', async () => {
    acceptWords.mockResolvedValue({ accepted_count: 2 });
    getInboxWords.mockRejectedValue(new Error('offline'));
    setup();
    fireEvent.click(screen.getByLabelText('Select one')); fireEvent.click(screen.getByLabelText('Select two'));
    fireEvent.click(screen.getByRole('button', { name: 'Accept selected' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Review saved, but the Inbox could not refresh');
});

test('uses the saved theme and responds to theme and storage changes', () => {
    localStorage.setItem('wordmage.albumTheme', 'obsidian');
    try {
        setup();
        // Theme classes belong to the page wrapper rather than a semantic control.
        // eslint-disable-next-line testing-library/no-node-access
        const page = screen.getByText('Inbox').closest('.album-content-page');
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
