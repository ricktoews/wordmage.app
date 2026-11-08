import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import WordScroller from './WordScroller';
import WordSelection from './WordSelection';
import Popup from './Popup';
import { acceptWords, rejectWords, getInboxWords, markInboxWordsRead } from '../utils/api';

const ALBUM_THEMES = ['classic', 'paper', 'ink', 'arcane', 'eldritch', 'obsidian', 'fogbound'];

const getInboxTheme = theme => {
    const saved = theme || (typeof window !== 'undefined' ? window.localStorage.getItem('wordmage.albumTheme') : null);
    return ALBUM_THEMES.includes(saved) ? saved : 'classic';
};

function Inbox({ words, isLoading, error, onAIExplain, onMarkedRead, onWordsRefreshed }) {
    const [albumTheme, setAlbumTheme] = useState(() => getInboxTheme());
    const [readOnArrival, setReadOnArrival] = useState(() => new Map());

    // Keep the arrival status while this page is open, even after marking all words read.
    useEffect(() => {
        if (isLoading) return;
        setReadOnArrival(previous => {
            const next = new Map(previous);
            words.forEach(word => {
                if (!next.has(word.id)) next.set(word.id, Number(word.inbox_read) === 1);
            });
            return next;
        });
    }, [words, isLoading]);

    const isOlderEntry = word => readOnArrival.get(word.id) ?? (Number(word.inbox_read) === 1);
    const sortedWords = useMemo(() => {
        const isRead = word => readOnArrival.get(word.id) ?? (Number(word.inbox_read) === 1);
        return [...words.filter(word => !isRead(word)), ...words.filter(isRead)];
    }, [words, readOnArrival]);

    useEffect(() => {
        const handleThemeChanged = event => setAlbumTheme(getInboxTheme(event?.detail?.theme));
        const handleStorage = event => {
            if (event.key === 'wordmage.albumTheme') setAlbumTheme(getInboxTheme());
        };
        window.addEventListener('wordmage:albumThemeChanged', handleThemeChanged);
        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('wordmage:albumThemeChanged', handleThemeChanged);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const [selected, setSelected] = useState(new Set());
    const [busy, setBusy] = useState(false);
    const [confirmReject, setConfirmReject] = useState(false);
    const [message, setMessage] = useState('');
    const [actionError, setActionError] = useState('');
    const selectedIds = words.filter(word => selected.has(word.id)).map(word => word.id);
    const disabled = busy || isLoading || Boolean(error);

    const toggleSelection = id => {
        if (disabled) return;
        setSelected(previous => {
            const next = new Set(previous);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const review = async action => {
        if (disabled || !selectedIds.length) return;
        setConfirmReject(false);
        setBusy(true);
        setActionError('');
        setMessage('');
        let completed = false;
        try {
            const result = await (action === 'accept' ? acceptWords(selectedIds) : rejectWords(selectedIds));
            completed = true;
            setSelected(new Set());
            setMessage(action === 'reject' ? `${result.rejected_count} ${Number(result.rejected_count) === 1 ? 'word' : 'words'} rejected.` : 'Selected words accepted.');
            const refreshed = await getInboxWords();
            onWordsRefreshed(refreshed);
        } catch (error) {
            setActionError(completed
                ? 'Review saved, but the Inbox could not refresh. Reload the page to see the current words.'
                : 'Unable to review selected words. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        if (isLoading) return;

        markInboxWordsRead().then(onMarkedRead).catch(error => {
            console.error('Error marking inbox words as read:', error);
        });
    }, [isLoading, onMarkedRead]);

    return (
        <div className={`word-list-page-container album-content-page album-theme-${albumTheme}`}>
            <div className="favorites-toolbar">
                <div className="favorites-toolbar-content">
                    <div className="favorites-toolbar-title">Inbox</div>
                </div>
                <div className="moods-toolbar-actions">
                    <button type="button" className="moods-refresh-icon" title="Accept selected" aria-label="Accept selected"
                        disabled={disabled || !selectedIds.length} onClick={() => review('accept')}>
                        <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button type="button" className="moods-refresh-icon" title="Reject selected" aria-label="Reject selected"
                        disabled={disabled || !selectedIds.length} onClick={() => setConfirmReject(true)}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            </div>
            <div className="word-list-wrapper">
                {busy && <p role="status">Saving review and refreshing Inbox…</p>}
                {message && <p role="status">{message}</p>}
                {actionError && <p role="alert">{actionError}</p>}
                {isLoading ? <p role="status">Loading inbox words…</p> : error ? (
                    <p role="alert">{error}</p>
                ) : words.length === 0 ? <p>Your inbox is empty.</p> : (
                    <WordScroller hasMore={false} pool={sortedWords} startingNdx={0} listType="inbox" onAIExplain={onAIExplain}
                        wordContainerClassName={word => isOlderEntry(word) ? 'inbox-entry-read' : ''}
                        onWordSelectionToggle={word => toggleSelection(word.id)}
                        isWordSelected={word => selected.has(word.id)}
                        renderWordSelection={word => (
                            <WordSelection word={word.word} checked={selected.has(word.id)} disabled={disabled}
                                onToggle={() => toggleSelection(word.id)} />
                        )} />
                )}
            </div>
            <Popup isVisible={confirmReject} handleBackgroundClick={() => setConfirmReject(false)}>
                <div role="dialog" aria-modal="true" aria-labelledby="reject-inbox-title">
                    <div className="popup-header"><h2 id="reject-inbox-title">Reject selected words?</h2></div>
                    <div className="popup-body">
                        <p>Reject {selectedIds.length} selected words? Protected entries may remain in the Inbox.</p>
                        <div className="button-wrapper">
                            <button type="button" className="btn btn-default" onClick={() => setConfirmReject(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={() => review('reject')}>Confirm rejection</button>
                        </div>
                    </div>
                </div>
            </Popup>
        </div>
    );
}

export default Inbox;
