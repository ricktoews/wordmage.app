import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WordEntry from './WordEntry';
import WordSelection from './WordSelection';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

jest.mock('../utils/words-interface', () => ({
    isWordLiked: () => false,
    getHistoryScoringSettings: () => ({ viewport3sMs: 3000, viewport6sMs: 6000 }),
    recordWordInterestSignal: jest.fn()
}));

beforeEach(() => {
    global.IntersectionObserver = jest.fn(() => ({ observe: jest.fn(), disconnect: jest.fn() }));
});
afterEach(() => { delete global.IntersectionObserver; });

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
