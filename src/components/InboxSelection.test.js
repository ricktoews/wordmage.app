import { StrictMode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Inbox from './Inbox';
import { markInboxWordsRead } from '../utils/api';

jest.mock('../utils/api', () => ({ markInboxWordsRead: jest.fn() }));
jest.mock('../utils/words-interface', () => ({
    isWordLiked: () => false,
    getHistoryScoringSettings: () => ({ viewport3sMs: 3000, viewport6sMs: 6000 }),
    recordWordInterestSignal: jest.fn()
}));
jest.mock('./PopupAlbumSelect', () => () => null);
jest.mock('./PopupWordShare', () => () => null);

test('Inbox checkboxes toggle through the actual scroller and card, updating the background', () => {
    global.IntersectionObserver = jest.fn(() => ({ observe: jest.fn(), disconnect: jest.fn() }));
    markInboxWordsRead.mockResolvedValue();
    const view = render(<StrictMode><MemoryRouter><Inbox
        words={[{ id: 1, word: 'Abature', def: 'Traces left by a stag.' }]}
        onMarkedRead={() => {}} onWordsRefreshed={() => {}} /></MemoryRouter></StrictMode>);
    try {
        const checkbox = screen.getByRole('checkbox', { name: 'Select Abature' });
        fireEvent.click(checkbox);
        expect(checkbox).toHaveAttribute('aria-checked', 'true');
        expect(checkbox.closest('.word-item')).toHaveClass('word-item-selected');
        expect(screen.getByRole('button', { name: 'Accept selected' })).not.toBeDisabled();
        fireEvent.click(checkbox.firstChild);
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
        expect(checkbox.closest('.word-item')).not.toHaveClass('word-item-selected');
        expect(screen.getByRole('button', { name: 'Accept selected' })).toBeDisabled();
        fireEvent.click(screen.getByText('Abature'));
        expect(checkbox).toHaveAttribute('aria-checked', 'true');
    } finally {
        view.unmount();
        delete global.IntersectionObserver;
    }
});
