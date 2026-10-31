import { useCallback, useEffect, useRef, useState } from 'react';
import { getNewWords } from '../utils/api';
import WordScroller from './WordScroller';

const ALBUM_THEMES = ['classic', 'paper', 'ink', 'arcane', 'eldritch', 'obsidian', 'fogbound'];

const getNewWordsTheme = theme => {
    const saved = theme || (typeof window !== 'undefined' ? window.localStorage.getItem('wordmage.albumTheme') : null);
    return ALBUM_THEMES.includes(saved) ? saved : 'classic';
};

function NewWords({ onAIExplain }) {
    const [albumTheme, setAlbumTheme] = useState(() => getNewWordsTheme());

    useEffect(() => {
        const handleThemeChanged = event => setAlbumTheme(getNewWordsTheme(event?.detail?.theme));
        const handleStorage = event => {
            if (event.key === 'wordmage.albumTheme') setAlbumTheme(getNewWordsTheme());
        };
        window.addEventListener('wordmage:albumThemeChanged', handleThemeChanged);
        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('wordmage:albumThemeChanged', handleThemeChanged);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const [words, setWords] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const mounted = useRef(false);
    const pending = useRef(false);
    const load = useCallback(async (offset = 0) => {
        if (pending.current) return;
        pending.current = true;
        setLoading(true);
        setError('');
        try {
            const data = await getNewWords({ limit: 50, offset });
            if (!mounted.current) return;
            setWords(previous => offset === 0 ? data.words : [...previous, ...data.words]);
            setPagination(data.pagination);
        } catch (error) {
            if (mounted.current) setError('Unable to load new words. Please try again.');
        } finally {
            pending.current = false;
            if (mounted.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        mounted.current = true;
        load();
        return () => { mounted.current = false; };
    }, [load]);

    const nextOffset = pagination?.next_offset ?? (Number(pagination?.offset || 0) + Number(pagination?.limit || 50));
    const hasMore = pagination && (pagination.has_more ?? (nextOffset < Number(pagination.total ?? pagination.total_count)));

    return (
        <div className={`word-list-page-container album-content-page album-theme-${albumTheme}`}>
            <div className="favorites-toolbar"><div className="favorites-toolbar-content"><div className="favorites-toolbar-title">New Words</div></div></div>
            <div className="word-list-wrapper">
                <WordScroller hasMore={false} pool={words} startingNdx={0} listType="new-words" onAIExplain={onAIExplain}
                    renderWordMetadata={word => word.accepted_at && (
                        <div className="new-word-accepted-date">Accepted <time dateTime={word.accepted_at.replace(' ', 'T')}>{word.accepted_at}</time></div>
                    )} />
                {loading && <p role="status">Loading new words…</p>}
                {error && <p role="alert">{error}</p>}
                {!loading && !error && words.length === 0 && <p>No new words yet.</p>}
                <div className="new-words-pagination">
                    {error ? <button className="btn btn-default" disabled={loading} onClick={() => load(pagination ? nextOffset : 0)}>Try again</button>
                        : hasMore && <button className="btn btn-default" disabled={loading} onClick={() => load(nextOffset)}>Load More</button>}
                </div>
            </div>
        </div>
    );
}

export default NewWords;
