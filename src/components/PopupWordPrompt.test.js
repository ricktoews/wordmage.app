import { render, screen, fireEvent } from '@testing-library/react';
import PopupWordPrompt from './PopupWordPrompt';
import { copyTextToClipboard } from '../utils/page-download';

jest.mock('../utils/page-download', () => ({ copyTextToClipboard: jest.fn() }));

test('defaults to dictionary entry and etymology and updates the copied prompt when toggled', async () => {
    copyTextToClipboard.mockResolvedValue(true);
    render(<PopupWordPrompt wordObj={{ word: 'abature', def: 'Traces left by a stag.' }} onClose={() => {}} />);
    const prompt = screen.getByRole('region', { name: 'Your prompt' });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(prompt.textContent).toContain("I'd like to ask AI about the word abature.");
    expect(prompt.textContent).not.toContain('The definition I have:');
    expect(prompt.textContent).not.toContain('Keep the explanation clear and concise.');
    expect(screen.getAllByRole('button', { pressed: true }).map((button) => button.getAttribute('aria-label'))).toEqual(['Dictionary entry', 'Etymology']);
    expect(Array.from(prompt.querySelectorAll('button')).map((button) => button.getAttribute('aria-label'))).toEqual(['Dictionary entry', 'Etymology', 'Usage examples', 'Usage notes', 'Pronunciation']);
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(2);
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Pronunciation' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Pronunciation' }));
    expect(screen.getByRole('button', { name: 'Pronunciation' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Dictionary entry' }));
    expect(screen.getByRole('button', { name: 'Dictionary entry' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));
    const copied = copyTextToClipboard.mock.calls.slice(-1)[0][0];
    expect(copied).toContain('Etymology:');
    expect(copied).not.toContain('dictionary-style entry');
    expect(copied).not.toContain('Usage notes:');
    expect(copied).not.toMatch(/\n\d+\./);
    await screen.findByText('Copied! Paste the prompt into your AI tool.');
    fireEvent.click(screen.getByRole('button', { name: 'Pronunciation' }));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole('button', { name: 'Etymology' }));
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));
    expect(copyTextToClipboard.mock.calls.slice(-1)[0][0]).not.toContain('Please include:');
    await screen.findByText('Copied! Paste the prompt into your AI tool.');
});

test('copies the full prompt including the hidden introduction and closing', async () => {
    copyTextToClipboard.mockResolvedValue(true);
    render(<PopupWordPrompt wordObj={{ word: 'susurrus', def: 'A whispering sound' }} onClose={() => {}} />);
    const prompt = screen.getByRole('region', { name: 'Your prompt' });
    expect(screen.getByRole('dialog')).toHaveFocus();
    expect(prompt.textContent).toContain('susurrus');
    expect(prompt.textContent).not.toContain('A whispering sound');
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));
    const copied = copyTextToClipboard.mock.calls.slice(-1)[0][0];
    expect(copied).toContain('susurrus');
    expect(copied).toContain('A whispering sound');
    expect(copied).toBe([
        'Help me understand the word "susurrus". The definition I have: "A whispering sound". Please check it rather than assuming it is correct.',
        'Please include:',
        'A concise dictionary-style entry with part of speech and main meanings, highlighting the meaning relevant to the card.',
        'Etymology: its origin, roots, and how its meaning developed.',
        'Keep the explanation clear and concise. Distinguish established facts from uncertain or disputed claims. If you cannot verify a detail, say so instead of guessing. Cite reliable dictionary or etymology sources when available; do not invent citations.'
    ].join('\n\n'));
    expect(await screen.findByText('Copied! Paste the prompt into your AI tool.')).toBeInTheDocument();
});

test('selects the prompt for manual copying when clipboard access fails', async () => {
    copyTextToClipboard.mockRejectedValue(new Error('Denied'));
    const onClose = jest.fn();
    render(<PopupWordPrompt wordObj={{ word: 'susurrus' }} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));
    expect(await screen.findByText(/Could not copy automatically/)).toBeInTheDocument();
    const prompt = screen.getByRole('region', { name: 'Your prompt' });
    const manualPrompt = screen.getByRole('region', { name: 'Prompt for manual copying' });
    expect(window.getSelection().toString()).toBe(manualPrompt.textContent);
    expect(manualPrompt.textContent).toContain('Etymology:');
    expect(manualPrompt.textContent).toContain('Keep the explanation clear and concise.');
    expect(manualPrompt.textContent).toBe(copyTextToClipboard.mock.calls.slice(-1)[0][0]);
    fireEvent.keyDown(prompt, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
});
