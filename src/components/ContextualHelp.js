import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const TARGET_PADDING = 5;
const VIEWPORT_GUTTER = 12;
const CARD_GAP = 12;
export const CONTEXTUAL_HELP_LONG_PRESS_MS = 600;
const MOVE_TOLERANCE = 10;

function getTargetRect(target) {
	const rect = target.getBoundingClientRect();
	const top = Math.max(0, rect.top - TARGET_PADDING);
	const right = Math.min(window.innerWidth, rect.right + TARGET_PADDING);
	const bottom = Math.min(window.innerHeight, rect.bottom + TARGET_PADDING);
	const left = Math.max(0, rect.left - TARGET_PADDING);

	return {
		top,
		right,
		bottom,
		left,
		width: right - left,
		height: bottom - top,
	};
}

function getCardPosition(targetRect) {
	const cardWidth = Math.min(320, window.innerWidth - (VIEWPORT_GUTTER * 2));
	const left = Math.min(
		Math.max(VIEWPORT_GUTTER, targetRect.right - cardWidth),
		window.innerWidth - cardWidth - VIEWPORT_GUTTER
	);
	const showBelow = targetRect.bottom + CARD_GAP + 150 < window.innerHeight;

	return {
		left,
		top: showBelow ? targetRect.bottom + CARD_GAP : 'auto',
		bottom: showBelow ? 'auto' : window.innerHeight - targetRect.top + CARD_GAP,
		width: cardWidth,
	};
}

function ContextualHelp({ hints = [] }) {
	const [activeHelp, setActiveHelp] = useState(null);
	const [targetRect, setTargetRect] = useState(null);
	const pressRef = useRef(null);
	const suppressedClickTargetRef = useRef(null);

	const updateTargetRect = useCallback(() => {
		if (!activeHelp) {
			return;
		}

		setTargetRect(activeHelp.target.isConnected ? getTargetRect(activeHelp.target) : null);
	}, [activeHelp]);

	useEffect(() => {
		if (typeof document === 'undefined') {
			return undefined;
		}

		const clearPress = () => {
			if (pressRef.current?.timer) {
				window.clearTimeout(pressRef.current.timer);
			}
			pressRef.current = null;
		};

		const handlePointerDown = (event) => {
			if (event.button !== undefined && event.button !== 0) {
				return;
			}

			const matchedHint = hints.find((hint) => event.target.closest?.(hint.target));
			if (!matchedHint) {
				return;
			}

			const target = event.target.closest(matchedHint.target);
			clearPress();
			pressRef.current = {
				hint: matchedHint,
				target,
				pointerId: event.pointerId,
				startX: event.clientX,
				startY: event.clientY,
				timer: window.setTimeout(() => {
					suppressedClickTargetRef.current = target;
					setActiveHelp({ hint: matchedHint, target });
					pressRef.current = null;
				}, CONTEXTUAL_HELP_LONG_PRESS_MS),
			};
		};

		const handlePointerMove = (event) => {
			const press = pressRef.current;
			if (!press || press.pointerId !== event.pointerId) {
				return;
			}

			if (
				Math.abs(event.clientX - press.startX) > MOVE_TOLERANCE
				|| Math.abs(event.clientY - press.startY) > MOVE_TOLERANCE
			) {
				clearPress();
			}
		};

		const handlePointerEnd = (event) => {
			if (pressRef.current?.pointerId === event.pointerId) {
				clearPress();
			}
		};

		const handleClick = (event) => {
			const target = suppressedClickTargetRef.current;
			if (!target || !target.contains(event.target)) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			suppressedClickTargetRef.current = null;
		};

		const handleContextMenu = (event) => {
			const target = suppressedClickTargetRef.current || pressRef.current?.target;
			if (target?.contains(event.target)) {
				event.preventDefault();
			}
		};

		document.addEventListener('pointerdown', handlePointerDown, true);
		document.addEventListener('pointermove', handlePointerMove, true);
		document.addEventListener('pointerup', handlePointerEnd, true);
		document.addEventListener('pointercancel', handlePointerEnd, true);
		document.addEventListener('click', handleClick, true);
		document.addEventListener('contextmenu', handleContextMenu, true);

		return () => {
			clearPress();
			document.removeEventListener('pointerdown', handlePointerDown, true);
			document.removeEventListener('pointermove', handlePointerMove, true);
			document.removeEventListener('pointerup', handlePointerEnd, true);
			document.removeEventListener('pointercancel', handlePointerEnd, true);
			document.removeEventListener('click', handleClick, true);
			document.removeEventListener('contextmenu', handleContextMenu, true);
		};
	}, [hints]);

	useEffect(() => {
		if (!activeHelp) {
			setTargetRect(null);
			return undefined;
		}

		updateTargetRect();
		window.addEventListener('resize', updateTargetRect);
		window.addEventListener('scroll', updateTargetRect, true);

		return () => {
			window.removeEventListener('resize', updateTargetRect);
			window.removeEventListener('scroll', updateTargetRect, true);
		};
	}, [activeHelp, updateTargetRect]);

	const dismissHint = useCallback(() => {
		suppressedClickTargetRef.current = null;
		setActiveHelp(null);
	}, []);

	useEffect(() => {
		if (!activeHelp) {
			return undefined;
		}

		const handleKeyDown = (event) => {
			if (event.key === 'Escape') {
				dismissHint();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [activeHelp, dismissHint]);

	if (!activeHelp || !targetRect || typeof document === 'undefined') {
		return null;
	}

	const cardPosition = getCardPosition(targetRect);

	return createPortal(
		<div className="contextual-help" aria-live="polite">
			<div
				className="contextual-help-dimmer"
				style={{
					'--contextual-help-cutout-x': `${targetRect.left + (targetRect.width / 2)}px`,
					'--contextual-help-cutout-y': `${targetRect.top + (targetRect.height / 2)}px`,
					'--contextual-help-cutout-width': `${targetRect.width / 2}px`,
					'--contextual-help-cutout-height': `${targetRect.height / 2}px`,
				}}
				onClick={dismissHint}
				aria-hidden="true"
			/>
			<div
				className="contextual-help-highlight"
				style={{
					top: targetRect.top,
					left: targetRect.left,
					width: targetRect.width,
					height: targetRect.height,
				}}
				aria-hidden="true"
			/>
			<aside
				className="contextual-help-card"
				style={cardPosition}
				aria-label={`${activeHelp.hint.title} help`}
			>
				<div className="contextual-help-title">{activeHelp.hint.title}</div>
				<p>{activeHelp.hint.text}</p>
				<button type="button" className="contextual-help-dismiss" onClick={dismissHint} autoFocus>
					Got it
				</button>
			</aside>
		</div>,
		document.body
	);
}

export default ContextualHelp;
