import { useEffect, useState } from 'react';
import WordScroller from './WordScroller';
import { markInboxWordsRead, removeInboxWords } from '../utils/api';

function Inbox({ words, isLoading, error, onAIExplain, onMarkedRead, onWordsRemoved }) {
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isRemoving, setIsRemoving] = useState(false);
    const [actionError, setActionError] = useState(null);
    const selectedWords = words.filter(word => selectedIds.has(word.id));

    const toggleWord = id => {
        setSelectedIds(previous => {
            const next = new Set(previous);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleRemove = async () => {
        if (isRemoving || !selectedWords.length) return;
        const wordIds = selectedWords.map(word => word.id);
        setIsRemoving(true);
        setActionError(null);
        try {
            await removeInboxWords(wordIds);
            onWordsRemoved(wordIds);
            setSelectedIds(new Set());
        } catch (error) {
            setActionError('Unable to remove selected words from the Inbox. Please try again.');
        } finally {
            setIsRemoving(false);
        }
    };
    useEffect(() => {
        if (isLoading) return;

        markInboxWordsRead().then(onMarkedRead).catch(error => {
            console.error('Error marking inbox words as read:', error);
        });
    }, [isLoading, onMarkedRead]);

    return (
        <div className="word-list-page-container album-content-page">
            <div className="favorites-toolbar">
                <div className="favorites-toolbar-content">
                    <div className="favorites-toolbar-title">Inbox</div>
                    {!isLoading && !error && words.length > 0 && (
                        <div className="favorites-toolbar-actions">
                            <button type="button" className="btn btn-default" disabled={isRemoving}
                                onClick={() => setSelectedIds(selectedWords.length === words.length ? new Set() : new Set(words.map(word => word.id)))}>
                                {selectedWords.length === words.length ? 'Clear selection' : 'Select all'}
                            </button>
                            <span role="status">{selectedWords.length} selected</span>
                            <button type="button" className="btn btn-default" disabled={isRemoving || !selectedWords.length} onClick={handleRemove}>
                                {isRemoving ? 'Removing…' : 'Remove from Inbox'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="word-list-wrapper">
                {actionError && <p role="alert">{actionError}</p>}
                {isLoading ? <p role="status">Loading inbox words…</p> : error ? (
                    <p role="alert">{error}</p>
                ) : words.length === 0 ? <p>Your inbox is empty.</p> : (
                    <WordScroller pool={words} startingNdx={0} listType="inbox" onAIExplain={onAIExplain}
                        renderWordSelection={word => (
                            <label className="inbox-word-selection">
                                <input type="checkbox" checked={selectedIds.has(word.id)} disabled={isRemoving}
                                    onChange={() => toggleWord(word.id)} />
                                <span>Select {word.word}</span>
                            </label>
                        )} />
                )}
            </div>
        </div>
    );
}

export default Inbox;
