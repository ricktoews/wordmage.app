import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WordEntry from './WordEntry';
import WordsInterface from '../utils/words-interface';
import { authFetch } from '../utils/auth';
jest.mock('../utils/auth', () => ({ authFetch: jest.fn() }));
import WordSelection from './WordSelection';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

jest.mock('../utils/words-interface', () => ({
    isWordLiked: jest.fn(() => false),
    getAlbumIds: () => ({ Favorites: 42 }),
    addToLiked: jest.fn(),
    removeFromLiked: jest.fn(),
    getHistoryScoringSettings: () => ({ viewport3sMs: 3000, viewport6sMs: 6000 }),
    recordWordInterestSignal: jest.fn()
}));

beforeEach(() => {
    authFetch.mockReset();
    WordsInterface.isWordLiked.mockReturnValue(false);
    WordsInterface.addToLiked.mockReset();
    WordsInterface.removeFromLiked.mockReset();
    WordsInterface.recordWordInterestSignal.mockClear();
    global.IntersectionObserver = jest.fn(() => ({ observe: jest.fn(), disconnect: jest.fn() }));
});
afterEach(() => { delete global.IntersectionObserver; jest.restoreAllMocks(); });

function Card({ disabled = false }) {
    const [checked, setChecked] = useState(false);
    const toggle = () => { if (!disabled) setChecked(previous => !previous); };
    return <WordEntry wordObj={{ id: 1, word: 'Abature', def: 'Traces left by a stag.' }} listType="inbox"
        selected={checked} onSelectionToggle={toggle}
        selectionControl={<WordSelection word="Abature" checked={checked} disabled={disabled} onToggle={toggle} />} />;
}

test('tapping word, definition or card toggles selection; checkbox and checkmark toggle only once', () => {
    render(<Card />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(screen.getByText('Abature'));
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(checkbox.closest('.word-item')).toHaveClass('word-item-selected');
    fireEvent.click(screen.getByText('Traces left by a stag.'));
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(checkbox.closest('.word-item')).not.toHaveClass('word-item-selected');
    fireEvent.click(checkbox.closest('.word-item'));
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(checkbox.firstChild);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
});

test('card taps cannot change disabled selection', () => {
    render(<Card disabled />);
    fireEvent.click(screen.getByText('Abature'));
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
});

test('direct native checkbox clicks work with the React 18 event root', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    try {
        act(() => root.render(<Card />));
        const checkbox = container.querySelector('[role=checkbox]');
        act(() => checkbox.click());
        expect(checkbox).toHaveAttribute('aria-checked', 'true');
        expect(checkbox.closest('.word-item')).toHaveClass('word-item-selected');
        act(() => checkbox.click());
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
        expect(checkbox.closest('.word-item')).not.toHaveClass('word-item-selected');
    } finally {
        act(() => root.unmount());
        container.remove();
    }
});

test('compact Ask AI action opens the same prompt and returns focus when closed', () => {
    WordsInterface.recordWordInterestSignal.mockClear();
    render(<WordEntry wordObj={{ id: 5, word: 'clepsydra', def: 'A water clock.' }} listType="random" />);
    const ask = screen.getByRole('button', { name: 'Ask AI about clepsydra' });
    expect(ask).toHaveAttribute('title', 'Ask AI about clepsydra');
    expect(screen.getByRole('button', { name: 'Word options' })).toBeInTheDocument();
    fireEvent.click(ask);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(WordsInterface.recordWordInterestSignal).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Close prompt' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(ask).toHaveFocus();
});

test('Inbox selection cards continue to omit Ask AI', () => {
    render(<Card />);
    expect(screen.queryByRole('button', { name: /Ask AI/i })).not.toBeInTheDocument();
});

function useMockFavorites() {
    let liked = false;
    WordsInterface.isWordLiked.mockImplementation(() => liked);
    const changed = word => window.dispatchEvent(new CustomEvent('wordmage:favoritesChanged', { detail: { word: word.word } }));
    WordsInterface.addToLiked.mockImplementation(word => { liked = true; changed(word); });
    WordsInterface.removeFromLiked.mockImplementation(word => { liked = false; changed(word); });
}

test('thumb toggles Favorites and stays synchronized with the existing menu action', async () => {
    useMockFavorites();
    authFetch.mockResolvedValue({ ok: true });
    const refresh = jest.fn();
    render(<WordEntry wordObj={{ id: 5, word: 'clepsydra', def: 'A water clock.' }} listType="random" onAlbumRefresh={refresh} />);
    const add = screen.getByRole('button', { name: 'Add clepsydra to Favorites' });
    expect(add).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(add.querySelector('path'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Remove clepsydra from Favorites' })).toHaveAttribute('aria-pressed', 'true'));
    expect(authFetch.mock.calls[0][0]).toMatch(/albums\/add-word$/);
    expect(JSON.parse(authFetch.mock.calls[0][1].body)).toEqual({ album_id: 42, word_id: 5 });
    expect(WordsInterface.recordWordInterestSignal.mock.calls.map(call => call[1])).toEqual(['favorite_or_album']);
    fireEvent.click(screen.getByRole('button', { name: 'Word options' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove Favorite' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add clepsydra to Favorites' })).toHaveAttribute('aria-pressed', 'false'));
    expect(authFetch.mock.calls[1][0]).toMatch(/albums\/delete-word$/);
    expect(refresh).toHaveBeenCalledTimes(2);
});

test('repeat taps cannot send duplicate favorite requests and duplicate cards update together', async () => {
    useMockFavorites();
    let complete;
    authFetch.mockImplementation(() => new Promise(resolve => { complete = resolve; }));
    render(<><WordEntry wordObj={{ id: 5, word: 'clepsydra', def: 'A water clock.' }} listType="random" />
        <WordEntry wordObj={{ id: 5, word: 'clepsydra', def: 'A water clock.' }} listType="browse" /></>);
    const add = screen.getAllByRole('button', { name: 'Add clepsydra to Favorites' })[0];
    fireEvent.click(add); fireEvent.click(add);
    expect(add).toBeDisabled();
    expect(authFetch).toHaveBeenCalledTimes(1);
    await act(async () => complete({ ok: true }));
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Remove clepsydra from Favorites' })).toHaveLength(2));
});

test('failed favorite request keeps the old state and allows retry', async () => {
    useMockFavorites();
    const alert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    authFetch.mockResolvedValue({ ok: false });
    render(<WordEntry wordObj={{ id: 5, word: 'clepsydra', def: 'A water clock.' }} listType="random" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add clepsydra to Favorites' }));
    await waitFor(() => expect(alert).toHaveBeenCalled());
    const button = screen.getByRole('button', { name: 'Add clepsydra to Favorites' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).not.toBeDisabled();
    expect(WordsInterface.addToLiked).not.toHaveBeenCalled();
});

test('Inbox and read-only cards do not expose favorite toggles', () => {
    render(<><Card /><WordEntry wordObj={{ id: 5, word: 'clepsydra', def: 'A water clock.' }} listType="album" readOnly /></>);
    expect(screen.queryByRole('button', { name: /to Favorites|from Favorites/ })).not.toBeInTheDocument();
});
