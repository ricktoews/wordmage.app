import { render, screen, fireEvent } from '@testing-library/react';
import PopupWordPrompt from './PopupWordPrompt';
import { copyTextToClipboard } from '../utils/page-download';

jest.mock('../utils/page-download', () => ({ copyTextToClipboard: jest.fn() }));

test('defaults to the first two sections and updates the copied prompt when toggled', async () => {
    copyTextToClipboard.mockResolvedValue(true);
    render(<PopupWordPrompt wordObj={{ word: 'abature', def: 'Traces left by a stag.' }} onClose={() => {}} />);
    const prompt = screen.getByRole('region', { name: 'Your prompt' });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(prompt.textContent).toContain('Help me understand the word "abature". The definition I have: "Traces left by a stag.". Please check it rather than assuming it is correct.');
    screen.getAllByRole('button', { pressed: true }).forEach((button) => {
        expect(['Dictionary entry', 'Pronunciation']).toContain(button.textContent.slice(1));
    });
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(2);
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(3);
    expect(prompt.textContent).not.toContain('Etymology:');
    fireEvent.click(screen.getByRole('button', { name: 'Etymology' }));
    expect(prompt.textContent).toContain('3. Etymology:');
    expect(screen.getByRole('button', { name: 'Etymology' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Dictionary entry' }));
    expect(prompt.textContent).not.toContain('dictionary-style entry');
    expect(screen.getByRole('button', { name: 'Dictionary entry' })).toHaveAttribute('aria-pressed', 'false');
    expect(prompt.textContent).toContain('1. Pronunciation');
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));
    expect(copyTextToClipboard).toHaveBeenLastCalledWith(prompt.textContent);
    await screen.findByText('Copied! Paste the prompt into your AI tool.');
    fireEvent.click(screen.getByRole('button', { name: 'Pronunciation' }));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole('button', { name: 'Etymology' }));
    expect(prompt.textContent).not.toContain('Please include:');
});

test('copies the displayed prompt with the word and definition', async () => {
    copyTextToClipboard.mockResolvedValue(true);
    render(<PopupWordPrompt wordObj={{ word: 'susurrus', def: 'A whispering sound' }} onClose={() => {}} />);
    const prompt = screen.getByRole('region', { name: 'Your prompt' });
    expect(screen.getByRole('dialog')).toHaveFocus();
    expect(prompt.textContent).toContain('susurrus');
    expect(prompt.textContent).toContain('A whispering sound');
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));
    expect(copyTextToClipboard).toHaveBeenCalledWith(prompt.textContent);
    expect(await screen.findByText('Copied! Paste the prompt into your AI tool.')).toBeInTheDocument();
});

test('selects the prompt for manual copying when clipboard access fails', async () => {
    copyTextToClipboard.mockRejectedValue(new Error('Denied'));
    const onClose = jest.fn();
    render(<PopupWordPrompt wordObj={{ word: 'susurrus' }} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));
    expect(await screen.findByText(/Could not copy automatically/)).toBeInTheDocument();
    const prompt = screen.getByRole('region', { name: 'Your prompt' });
    expect(window.getSelection().toString()).toBe(prompt.textContent);
    fireEvent.keyDown(prompt, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
});
