import { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import OpenCloseIcon from './icons/OpenCloseIcon';
import WordsInterface from '../utils/words-interface';
import Scramble from './Scramble';

function Spotlight(props) {
    const [introMessage, setIntroMessage] = useState('');
    const [randomeWordSelected, setRandomWordSelected] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [hintTrigger, setHintTrigger] = useState(0);
    const [showWordTrigger, setShowWordTrigger] = useState(0);

    // Check state for selected scrambled word.
    const state = props.location.state;
    // Check for word to be scrambled, passed in with URL.
    const spotlightWord = props.match?.params?.word;
    const [randomPick, setRandomPick] = useState(!spotlightWord && state === undefined ? true : false);
    var scrambledItem;
    if (randomPick === false) {
        // Not random if word was passed via URL or state.
        if (spotlightWord) {
            scrambledItem = WordsInterface.getWordObjByWord(spotlightWord);
        } else if (state) {
            scrambledItem = state.wordObj;
        } else {
            scrambledItem = WordsInterface.getSpotlightItem();
        }
    }
    else {
        scrambledItem = WordsInterface.getSpotlightItem();
    }
    const [item, setItem] = useState(scrambledItem);

    useEffect(() => {
        if (props.match.params.word && props.match.params.def) {
            let { word, def } = props.match.params;
            WordsInterface.saveCustomWord(-1, word, def);
            props.history.push('/spotlight-list');
        } else if (item.word === '') {
            setIntroMessage(`Once you've marked words you want to learn, come here for the challenge of unscrambling random selections.`)
            //props.history.push('/browse');
        }
    }, []);

    const handleAnother = e => {
        var anotherItem = WordsInterface.getSpotlightItem();
        setItem(anotherItem);
    };

    const handleRefresh = e => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleHint = e => {
        setHintTrigger(prev => prev + 1);
    };

    const handleShowWord = e => {
        setShowWordTrigger(prev => prev + 1);
    };

    return (
        <div className="spotlight-container">
            {item.word > '' ? (
                <div className="spotlight-wrapper">
                    <div className="unscramble-toolbar">
                        <div className="unscramble-toolbar-title">Unscramble</div>
                        <div className="unscramble-toolbar-buttons">
                            <button className="badge" onClick={handleRefresh} title="Reset"><i className="glyphicon glyphicon-random"></i></button>
                            <button className="badge" onClick={handleHint} title="Hint"><i className="glyphicon glyphicon-question-sign"></i></button>
                            <button className="badge" onClick={handleShowWord} title="Show Word"><i className="glyphicon glyphicon-eye-open"></i></button>
                            <button className="badge" onClick={handleAnother} title="Another"><i className="glyphicon glyphicon-forward"></i></button>
                        </div>
                    </div>
                    
                    <div className="unscramble-definition-card">
                        <div className="word-item-def">
                            {item.def}
                        </div>
                    </div>
                    
                    <div className="spotlight">
                        <Scramble 
                            item={item} 
                            word={item.word} 
                            refreshTrigger={refreshTrigger}
                            hintTrigger={hintTrigger}
                            showWordTrigger={showWordTrigger}
                        />
                    </div>
                </div>)
                : (
                    <div className="browse">
                        <p>{introMessage}</p>
                    </div>
                )}
        </div>
    );
}

export default withRouter(Spotlight);
