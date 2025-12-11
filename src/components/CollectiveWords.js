import { useEffect, useState, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { WordMageContext } from '../WordMageContext';
import WordsInterface from '../utils/words-interface';

function CollectiveWords(props) {
    const { contextValue, setContextValue } = useContext(WordMageContext);

    const fullWordObjList = WordsInterface.collectiveWordList();
    const fullWordList = fullWordObjList.map(item => item.term);
    const [wordObjList, setWordObjList] = useState(fullWordObjList);
    const [wordList, setWordList] = useState(fullWordList);
    const [startingLetters, setStartingLetters] = useState(props.match.params.start || '');
    const [startingNdx, setStartingNdx] = useState(0);
    const [displayList, setDisplayList] = useState([]);
    const [sortBy, setSortBy] = useState('individual'); // 'individual' or 'term'
    const [showHighlightOnly, setShowHighlightOnly] = useState(true);
    const [featuredItem, setFeaturedItem] = useState(null);

    // Select a random highlighted item on mount
    useEffect(() => {
        const highlightedItems = fullWordObjList.filter(item => item.highlight);
        if (highlightedItems.length > 0) {
            const randomIndex = Math.floor(Math.random() * highlightedItems.length);
            setFeaturedItem(highlightedItems[randomIndex]);
        }
    }, []);

    // Sort the list based on current sort option
    const sortList = (list, sortOption) => {
        const sorted = [...list].sort((a, b) => {
            if (sortOption === 'term') {
                return (a.term || '').localeCompare(b.term || '');
            } else {
                return (a.refersTo || '').localeCompare(b.refersTo || '');
            }
        });
        return sorted;
    };

    // Combine items with the same term and merge their sources
    const combineTerms = (list) => {
        const termMap = new Map();
        
        list.forEach(item => {
            // Normalize for comparison (lowercase)
            const key = `${(item.term || '').toLowerCase()}|${(item.refersTo || '').toLowerCase()}|${(item.expression || '').toLowerCase()}`;
            
            if (termMap.has(key)) {
                const existing = termMap.get(key);
                if (item.source && !existing.sources.includes(item.source)) {
                    existing.sources.push(item.source);
                }
                // Keep highlight if any instance is highlighted
                if (item.highlight) {
                    existing.highlight = true;
                }
            } else {
                termMap.set(key, {
                    ...item,
                    sources: item.source ? [item.source] : []
                });
            }
        });
        
        return Array.from(termMap.values());
    };

    // Build the display list based on starting index
    const buildDisplayList = () => {
        let filteredList = showHighlightOnly
            ? wordObjList.filter(item => item.highlight)
            : wordObjList;
        const combined = combineTerms(filteredList);
        const sorted = sortList(combined, sortBy);
        let ndx = -1;
        for (let i = 0; i < wordList.length && ndx === -1; i++) {
            if (wordList[i].toLowerCase().localeCompare(startingLetters) >= 0) {
                ndx = i;
                setStartingNdx(ndx);
            }
        }
        if (ndx === -1) ndx = 0;
        setDisplayList(sorted.slice(ndx));
    }

    useEffect(() => {
        buildDisplayList();
    }, [startingLetters, wordObjList, sortBy, showHighlightOnly]);

    useEffect(() => {
        setWordObjList(fullWordObjList);
        setWordList(fullWordList);
    }, [fullWordObjList.length]);

    var partialWordTimer;
    const handlePartialWord = e => {
        var el = e.target;
        var partial = el.value.toLowerCase();
        if (partialWordTimer) {
            clearTimeout(partialWordTimer);
        }
        partialWordTimer = setTimeout(() => {
            window.scrollTo(0, 0);
            setStartingLetters(partial);
            props.history.push('/collective/' + partial);
            el.blur();
        }, 2500);
    };

    return (
        <div className="browse-container">
            <div className="collective-toolbar">
                <div className="collective-toolbar-title">Collective Nouns</div>
                <div className="collective-toolbar-buttons">
                    <button
                        className={`badge ${showHighlightOnly ? 'badge-active' : ''}`}
                        onClick={() => setShowHighlightOnly(!showHighlightOnly)}
                        title="Toggle Highlights"
                    >
                        <i className="glyphicon glyphicon-star"></i>
                    </button>
                </div>
            </div>

            {featuredItem && (
                <div className="collective-featured">
                    <div className="collective-featured-header">
                        <div className="collective-featured-label">Featured Collective Noun</div>
                    </div>
                    <div className="collective-featured-content">
                        <div className="word-item collective-featured-item">
                            <div className="word-item-word-container">
                                <span className="featured-word-dot">•</span>
                                <div className="word-item-word">{featuredItem.term}</div>
                            </div>
                            <div className="word-item-def-container">
                                <div className="word-item-def">
                                    <strong>{featuredItem.refersTo}</strong>: {featuredItem.expression}
                                    {featuredItem.sources && featuredItem.sources.length > 0 && (
                                        <span> ({featuredItem.sources.join(', ')})</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="collective-sort-section">
                <button
                    className={`btn ${sortBy === 'individual' ? 'btn-active' : ''}`}
                    onClick={() => setSortBy('individual')}
                >
                    Individual
                </button>
                <button
                    className={`btn ${sortBy === 'term' ? 'btn-active' : ''}`}
                    onClick={() => setSortBy('term')}
                >
                    Term
                </button>
            </div>

            <div className="collective-list">
                {displayList.map((item, index) => (
                    <div key={index} className="word-item collective-word-item">
                        <div className="word-item-word-container">
                            <div className="word-item-word">
                                {sortBy === 'term' ? item.term : item.refersTo}
                            </div>
                        </div>
                        <div className="word-item-def-container">
                            <div className="word-item-def">
                                {item.expression}
                                {item.sources && item.sources.length > 0 && (
                                    <span> ({item.sources.join(', ')})</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default withRouter(CollectiveWords);
