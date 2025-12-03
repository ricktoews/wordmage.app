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

    // Build the display list based on starting index
    const buildDisplayList = () => {
        const sorted = sortList(wordObjList, sortBy);
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
    }, [startingLetters, wordObjList, sortBy]);

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
            <div className="browse">
                <div className="collective-sort-buttons">
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
            </div>

            <div className="collective-list">
                {displayList.map((item, index) => (
                    <div key={index} className="word-item">
                        <div className="word-item-word-container">
                            <div className="word-item-word">
                                {sortBy === 'term' ? item.term : item.refersTo}
                            </div>
                        </div>
                        <div className="word-item-def-container">
                            <div className="word-item-def">
                                {item.expression}
                                {item.source && <span> ({item.source})</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default withRouter(CollectiveWords);
