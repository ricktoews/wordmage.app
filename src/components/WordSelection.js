function WordSelection({ word, checked, disabled, onToggle }) {
    return (
        <button type="button" role="checkbox" aria-label={`Select ${word}`} aria-checked={checked}
            className="inbox-word-selection" disabled={disabled} onClick={event => {
                event.stopPropagation();
                onToggle();
            }}>
            <span className="inbox-word-selection-box" aria-hidden="true">{checked ? '✓' : ''}</span>
        </button>
    );
}

export default WordSelection;
