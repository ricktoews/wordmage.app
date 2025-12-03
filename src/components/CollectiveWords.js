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

    // Build the display list based on starting index
    const buildDisplayList = () => {
        let ndx = -1;
        for (let i = 0; i < wordList.length && ndx === -1; i++) {
            if (wordList[i].toLowerCase().localeCompare(startingLetters) >= 0) {
                ndx = i;
                setStartingNdx(ndx);
            }
        }
        if (ndx === -1) ndx = 0;
        setDisplayList(wordObjList.slice(ndx));
    }

    useEffect(() => {
        buildDisplayList();
    }, [startingLetters, wordObjList]);

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
                <input type="text" autoCapitalize="off" className="partial-word" onChange={handlePartialWord} placeholder="Jump to" />
            </div>

            <div className="collective-list">
                {displayList.map((item, index) => (
                    <div key={index} className="word-item">
                        <div className="word-item-word-container">
                            <div className="word-item-word">{item.refersTo}</div>
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
