import { render, screen, fireEvent } from '@testing-library/react';
import PopupWordPrompt from './PopupWordPrompt';
import { copyTextToClipboard } from '../utils/page-download';

jest.mock('../utils/page-download', () => ({ copyTextToClipboard: jest.fn() }));

test('defaults to the first two sections and updates the copied prompt when toggled', async () => {
    copyTextToClipboard.mockResolvedValue(true);
    render(<PopupWordPrompt wordObj={{ word: 'abature', def: 'Traces left by a stag.' }} onClose={() => {}} />);
    const prompt = screen.getByRole('textbox');
    expect(prompt.value).toContain('Help me understand the word "abature". The definition I have: "Traces left by a stag.". Please check it rather than assuming it is correct.');
    screen.getAllByRole('button', { pressed: true }).forEach((button) => {
        expect(['Dictionary entry', 'Pronunciation']).toContain(button.textContent.slice(1));
    });
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(2);
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(3);
    expect(prompt.value).not.toContain('Etymology:');
    fireEvent.click(screen.getByRole('button', { name: 'Etymology' }));
    expect(prompt.value).toContain('3. Etymology:');
    expect(screen.getByRole('button', { name: 'Etymology' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Dictionary entry' }));
    expect(prompt.value).not.toContain('dictionary-style entry');
    expect(screen.getByRole('button', { name: 'Dictionary entry' })).toHaveAttribute('aria-pressed', 'false');
    expect(prompt.value).toContain('1. Pronunciation');
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));
    expect(copyTextToClipboard).toHaveBeenLastCalledWith(prompt.value);
    await screen.findByText('Copied! Paste the prompt into your AI tool.');
    fireEvent.click(screen.getByRole('button', { name: 'Pronunciation' }));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole('button', { name: 'Etymology' }));
    expect(prompt.value).not.toContain('Please include:');
});

test('copies the displayed prompt with the word and definition', async () => {
    copyTextToClipboard.mockResolvedValue(true);
    render(<PopupWordPrompt wordObj={{ word: 'susurrus', def: 'A whispering sound' }} onClose={() => {}} />);
    const prompt = screen.getByRole('textbox');
    expect(prompt.value).toContain('susurrus');
    expect(prompt.value).toContain('A whispering sound');
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));
    expect(copyTextToClipboard).toHaveBeenCalledWith(prompt.value);
    expect(await screen.findByText('Copied! Paste the prompt into your AI tool.')).toBeInTheDocument();
});

test('selects the prompt for manual copying when clipboard access fails', async () => {
    copyTextToClipboard.mockRejectedValue(new Error('Denied'));
    const onClose = jest.fn();
    render(<PopupWordPrompt wordObj={{ word: 'susurrus' }} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));
    expect(await screen.findByText(/Could not copy automatically/)).toBeInTheDocument();
    const prompt = screen.getByRole('textbox');
    expect(prompt).toHaveFocus();
    expect(prompt.selectionEnd).toBe(prompt.value.length);
    fireEvent.keyDown(prompt, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
});
