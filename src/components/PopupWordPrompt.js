import { useEffect, useRef, useState, useId } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { copyTextToClipboard } from '../utils/page-download';
import Popup from './Popup';

const promptSections = [
    { label: 'Dictionary entry', text: 'A concise dictionary-style entry with part of speech and main meanings, highlighting the meaning relevant to the card.' },
    { label: 'Etymology', text: 'Etymology: its origin, roots, and how its meaning developed.' },
    { label: 'Usage examples', text: 'Three original example sentences that show natural usage.' },
    { label: 'Usage notes', text: 'Usage notes: formality, whether it is rare or archaic, and helpful synonyms or commonly confused words.' },
    { label: 'Pronunciation', text: 'Pronunciation in IPA and a plain-English pronunciation guide, including common regional variations. If you can provide audio, pronounce the word too.' },
];

function PopupWordPrompt({ wordObj, onClose }) {
    const [status, setStatus] = useState('');
    const [manualCopy, setManualCopy] = useState(false);
    const [selectedSections, setSelectedSections] = useState([true, true, false, false, false]);
    const dialogRef = useRef(null);
    const textRef = useRef(null);
    const titleId = useId();
    const definition = wordObj.def || wordObj.definition;
    const includedSections = promptSections.filter((_, index) => selectedSections[index]);
    const introduction = `Help me understand the word ${JSON.stringify(wordObj.word)}.${definition ? ` The definition I have: ${JSON.stringify(definition)}. Please check it rather than assuming it is correct.` : ''}`;
    const closing = 'Keep the explanation clear and concise. Distinguish established facts from uncertain or disputed claims. If you cannot verify a detail, say so instead of guessing. Cite reliable dictionary or etymology sources when available; do not invent citations.';
    const prompt = [introduction, ...(includedSections.length ? ['Please include:', ...includedSections.map((section) => section.text)] : []), closing].join('\n\n');

    useEffect(() => {
        if (!manualCopy || !textRef.current) return;
        const selection = window.getSelection();
        if (selection) {
            const range = document.createRange();
            range.selectNodeContents(textRef.current);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }, [manualCopy, prompt]);

    useEffect(() => {
        dialogRef.current?.focus({ preventScroll: true });
    }, []);

    const copyPrompt = async () => {
        try {
            if (await copyTextToClipboard(prompt)) {
                setStatus('Copied! Paste the prompt into your AI tool.');
                return;
            }
        } catch (_) {
            // Leave the full prompt available for manual copying.
        }
        setManualCopy(true);
        setStatus('Could not copy automatically. Copy the selected prompt manually.');
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
        }
        if (event.key === 'Tab') {
            const controls = dialogRef.current.querySelectorAll('button');
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    };

    return (
        <div onClick={(event) => event.stopPropagation()} onKeyDown={handleKeyDown}>
            <Popup isVisible handleBackgroundClick={onClose} className="word-prompt-popup themed-header-popup">
                <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId}>
                    <div className="popup-header">
                        <h2 id={titleId}><em>{wordObj.word}</em> — Ask AI</h2>
                        <button type="button" className="close-icon" aria-label="Close prompt"><FontAwesomeIcon icon={faXmark} /></button>
                    </div>
                    <div className="popup-body">
                        <div role="region" aria-label="Your prompt" className="word-prompt-preview">
                            <p>I'd like to ask AI about the word <em>{wordObj.word}</em>.</p>
                            <p>Please include:</p>
                            <div className="word-prompt-sections">
                                {promptSections.map((section, index) => (
                                    <button
                                        key={section.label}
                                        type="button"
                                        className="word-prompt-section"
                                        aria-label={section.label}
                                        aria-pressed={selectedSections[index]}
                                        onClick={() => {
                                            setSelectedSections((selected) => selected.map((value, i) => i === index ? !value : value));
                                            setStatus('');
                                            setManualCopy(false);
                                        }}
                                    >
                                        <span className="word-prompt-section-state" aria-hidden="true">{selectedSections[index] ? '✓' : '+'}</span>
                                        <span>{section.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {manualCopy && (
                            <div ref={textRef} role="region" aria-label="Prompt for manual copying" className="word-prompt-manual-copy">{prompt}</div>
                        )}
                        <p className="word-prompt-status" role="status" aria-live="polite">{status}</p>
                        <div className="button-wrapper">
                            <button type="button" className="btn btn-primary" onClick={copyPrompt}>Copy prompt</button>
                        </div>
                    </div>
                </div>
            </Popup>
        </div>
    );
}

export default PopupWordPrompt;
