import { act, fireEvent, render, screen } from '@testing-library/react';
import ContextualHelp, { CONTEXTUAL_HELP_LONG_PRESS_MS } from './ContextualHelp';

const hint = {
	id: 'theme-button-v1',
	target: '[data-contextual-help="theme-button"]',
	title: 'Choose your atmosphere',
	text: 'Change the look of WordMage.',
};

beforeEach(() => {
	jest.useFakeTimers();
});

afterEach(() => {
	jest.useRealTimers();
});

test('shows help only after a long press', () => {
	render(
		<>
			<button data-contextual-help="theme-button">Theme</button>
			<ContextualHelp hints={[hint]} />
		</>
	);

	expect(screen.queryByText('Choose your atmosphere')).not.toBeInTheDocument();

	fireEvent.pointerDown(screen.getByRole('button', { name: 'Theme' }), {
		pointerId: 1,
		button: 0,
		clientX: 10,
		clientY: 10,
	});
	act(() => {
		jest.advanceTimersByTime(CONTEXTUAL_HELP_LONG_PRESS_MS);
	});

	expect(screen.getByText('Choose your atmosphere')).toBeInTheDocument();
});

test('a short press does not show help', () => {
	render(
		<>
			<button data-contextual-help="theme-button">Theme</button>
			<ContextualHelp hints={[hint]} />
		</>
	);

	const button = screen.getByRole('button', { name: 'Theme' });
	fireEvent.pointerDown(button, {
		pointerId: 1,
		button: 0,
		clientX: 10,
		clientY: 10,
	});
	act(() => {
		jest.advanceTimersByTime(CONTEXTUAL_HELP_LONG_PRESS_MS - 1);
	});
	fireEvent.pointerUp(button, { pointerId: 1 });

	expect(screen.queryByText('Choose your atmosphere')).not.toBeInTheDocument();
});

test('opens the help associated with the pressed control', () => {
	const shareHint = {
		id: 'random-share-button-v1',
		target: '[data-contextual-help="random-share-button"]',
		title: 'Share your finds',
		text: 'Share these words.',
	};

	render(
		<>
			<button data-contextual-help="theme-button">Theme</button>
			<button data-contextual-help="random-share-button">Share</button>
			<ContextualHelp hints={[hint, shareHint]} />
		</>
	);

	fireEvent.pointerDown(screen.getByRole('button', { name: 'Share' }), {
		pointerId: 2,
		button: 0,
		clientX: 20,
		clientY: 10,
	});
	act(() => {
		jest.advanceTimersByTime(CONTEXTUAL_HELP_LONG_PRESS_MS);
	});

	expect(screen.getByText('Share your finds')).toBeInTheDocument();
	expect(screen.queryByText('Choose your atmosphere')).not.toBeInTheDocument();
});

test('suppresses the normal click after a long press', () => {
	const handleClick = jest.fn();

	render(
		<>
			<button data-contextual-help="theme-button" onClick={handleClick}>Theme</button>
			<ContextualHelp hints={[hint]} />
		</>
	);

	const button = screen.getByRole('button', { name: 'Theme' });
	fireEvent.pointerDown(button, {
		pointerId: 1,
		button: 0,
		clientX: 10,
		clientY: 10,
	});
	act(() => {
		jest.advanceTimersByTime(CONTEXTUAL_HELP_LONG_PRESS_MS);
	});
	fireEvent.pointerUp(button, { pointerId: 1 });
	fireEvent.click(button);

	expect(handleClick).not.toHaveBeenCalled();
	expect(screen.getByText('Choose your atmosphere')).toBeInTheDocument();
});
