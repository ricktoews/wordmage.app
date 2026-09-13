import { useEffect, useRef, useState, useId } from 'react';
import { copyTextToClipboard } from '../utils/page-download';
import Popup from './Popup';

const promptSections = [
    { label: 'Dictionary entry', text: 'A concise dictionary-style entry with part of speech and main meanings, highlighting the meaning relevant to the card.' },
    { label: 'Pronunciation', text: 'Pronunciation in IPA and a plain-English pronunciation guide, including common regional variations. If you can provide audio, pronounce the word too.' },
    { label: 'Etymology', text: 'Etymology: its origin, roots, and how its meaning developed.' },
    { label: 'Usage examples', text: 'Three original example sentences that show natural usage.' },
    { label: 'Usage notes', text: 'Usage notes: formality, whether it is rare or archaic, and helpful synonyms or commonly confused words.' },
];

function PopupWordPrompt({ wordObj, onClose }) {
    const [status, setStatus] = useState('');
    const [selectedSections, setSelectedSections] = useState([true, true, false, false, false]);
    const dialogRef = useRef(null);
    const textRef = useRef(null);
    const titleId = useId();
    const definition = wordObj.def || wordObj.definition;
    const includedSections = promptSections.filter((_, index) => selectedSections[index]);
    const prompt = `Help me understand the word ${JSON.stringify(wordObj.word)}.${definition ? ` The definition I have: ${JSON.stringify(definition)}. Please check it rather than assuming it is correct.` : ''}
${includedSections.length ? `
Please include:

${includedSections.map((section, index) => `${index + 1}. ${section.text}`).join('\n')}
` : ''}
Keep the explanation clear and concise. Distinguish established facts from uncertain or disputed claims. If you cannot verify a detail, say so instead of guessing. Cite reliable dictionary or etymology sources when available; do not invent citations.`;

    useEffect(() => {
        textRef.current?.focus();
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
        textRef.current?.focus();
        textRef.current?.select();
        setStatus('Could not copy automatically. Copy the selected prompt manually.');
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
        }
        if (event.key === 'Tab') {
            const controls = dialogRef.current.querySelectorAll('button, input, textarea');
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
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
            <Popup isVisible handleBackgroundClick={onClose} className="word-prompt-popup">
                <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId}>
                    <div className="popup-header">
                        <h2 id={titleId}>Ask AI about “{wordObj.word}”</h2>
                        <button type="button" className="close-icon" aria-label="Close prompt">×</button>
                    </div>
                    <div className="popup-body">
                        <p>Copy this prompt and paste it into ChatGPT, Gemini, Grok, Claude, or your preferred AI tool.</p>
                        <fieldset className="word-prompt-options">
                            <legend>Include in your prompt</legend>
                            {promptSections.map((section, index) => (
                                <button
                                    key={section.label}
                                    type="button"
                                    className="word-prompt-toggle"
                                    aria-pressed={selectedSections[index]}
                                    onClick={() => {
                                        setSelectedSections((selected) => selected.map((value, i) => i === index ? !value : value));
                                        setStatus('');
                                    }}
                                >
                                    <span aria-hidden="true">{selectedSections[index] ? '✓' : '+'}</span>
                                    {section.label}
                                </button>
                            ))}
                        </fieldset>
                        <label className="word-prompt-label">
                            Your prompt
                            <textarea ref={textRef} readOnly value={prompt} rows={12} />
                        </label>
                        <p role="status" aria-live="polite">{status}</p>
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
