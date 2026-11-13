import { useEffect, useState, useRef, useMemo } from 'react';
import { PublicContent } from './PublicContent';
import WordScroller from '../components/WordScroller';
import snapshot from './landing-snapshot.json';
import { getLandingPageWords } from '../utils/api';
import { landingResponse, selectWords, readSelection, saveSelection } from './landing-selection.mjs';

// Share an in-flight request across remounts (including StrictMode) without
// allowing an old request to overwrite a later explicit refresh.
const pending = new Map();
function fetchSelection(theme) {
    if (!pending.has(theme)) {
        const promise = getLandingPageWords(theme).then(data => landingResponse(data, theme))
            .finally(() => pending.delete(theme));
        pending.set(theme, promise);
    }
    return pending.get(theme);
}

export default function LandingPage({ page, ...props }) {
    const theme = page === '/rare-words' ? 'rare' : 'gothic';
    const [words, setWords] = useState(() => readSelection(theme) || snapshot[theme].slice(0, theme === 'rare' ? 9 : 13));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const cardWords = useMemo(() => words.slice(1), [words]);
    const mounted = useRef(false);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

    useEffect(() => {
        let active = true;
        const saved = readSelection(theme);
        if (saved) { setWords(saved); return undefined; }
        setLoading(true);
        fetchSelection(theme).then(pool => {
            // Persist even if navigation unmounted this page before it completed.
            const selection = readSelection(theme) || selectWords(pool, theme);
            saveSelection(theme, selection);
            if (active) setWords(selection);
        }).catch(() => {
            const fallback = readSelection(theme) || snapshot[theme].slice(0, theme === 'rare' ? 9 : 13);
            saveSelection(theme, fallback);
            if (active) { setWords(fallback); setError('Unable to load a fresh selection. Showing a saved selection from the collection.'); }
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [theme]);

    async function refresh() {
        if (loading) return;
        setLoading(true);
        setError('');
        try {
            const pool = await fetchSelection(theme);
            if (!mounted.current) return;
            const selection = selectWords(pool, theme, words);
            saveSelection(theme, selection);
            setWords(selection);
        } catch (_) {
            if (mounted.current) setError('Unable to load another selection. Your current words have been kept. Please try again.');
        } finally { if (mounted.current) setLoading(false); }
    }

    return <PublicContent page={page} {...props} landingWords={words}
        wordCards={<div className={`landing-app-cards album-content-page landing-editorial-cards landing-${theme}-cards`}>
            <WordScroller pool={cardWords} listType="browse" hasMore={false} startingNdx={0} />
        </div>}
        onRefresh={refresh} selectionLoading={loading} selectionError={error} />;
}
