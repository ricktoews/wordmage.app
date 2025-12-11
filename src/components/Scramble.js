import { useContext, useEffect, useState, useRef } from 'react';
import { scramble } from '../utils/spotlight';
import { WordMageContext } from '../WordMageContext';

function initLetters(scrambled) {
    var letterStates = [];
    var letters = scrambled.split('');
    letters.forEach(l => {
        letterStates.push({ [l]: false });
    });
    return letterStates;
}


function Scramble(props) {
    const { contextValue, setContextValue } = useContext(WordMageContext);

    const [scrambled, setScrambled] = useState(scramble(props.word));
    const [letterStates, setLetterStates] = useState(initLetters(scrambled));
    const [unscrambled, setUnscrambled] = useState('');
    const [finished, setFinished] = useState(false);
    const [showWord, setShowWord] = useState(false);
    const hintTimeoutsRef = useRef([]);
    const hintInProgressRef = useRef(false);

    useEffect(() => {
        let newScrambled = scramble(props.word);
        setScrambled(newScrambled);
        setLetterStates(initLetters(newScrambled));
        setUnscrambled('');
        setFinished(false);
    }, [props.word]);

    useEffect(() => {
        if (/[A-Z]/.test(contextValue.capturedKey)) {
            const letter = contextValue.capturedKey.toLowerCase();
            processLetter(letter);
        }
    }, [contextValue.capturedKey])

    useEffect(() => {
        if (unscrambled === props.word) {
            setFinished(true);
            setShowWord(false);
            setScrambled(scramble(props.word));
        }
    }, [unscrambled]);

    useEffect(() => {
        setLetterStates(initLetters(scrambled));
    }, [scrambled]);

    useEffect(() => {
        if (props.refreshTrigger > 0) {
            handleRefresh();
        }
    }, [props.refreshTrigger]);

    useEffect(() => {
        if (props.hintTrigger > 0) {
            handleHint();
        }
    }, [props.hintTrigger]);

    useEffect(() => {
        if (props.showWordTrigger > 0) {
            setShowWord(true);
        }
    }, [props.showWordTrigger]);

    const processLetter = (letter) => {
        let letterStatesClone = letterStates.slice(0);
        const ndx = letterStates.findIndex(item => item[letter] === false);
        if (ndx !== -1) {
            letterStatesClone[ndx][letter] = true;
            setLetterStates(letterStatesClone);
            setUnscrambled(unscrambled + letter);
        }
    }

    const selectLetter = e => {
        var el = e.target;
        var letter = el.textContent;
        var ndx = el.dataset.ndx;
        var letterStatesClone = Object.assign({}, letterStates);
        if (letterStatesClone[ndx][letter]) {
            letterStatesClone[ndx][letter] = !letterStatesClone[ndx][letter];
            setLetterStates(letterStatesClone);
            let letterNdx = unscrambled.lastIndexOf(letter);
            setUnscrambled(unscrambled.substr(0, letterNdx) + unscrambled.substr(letterNdx + 1));
        } else {
            letterStatesClone[ndx][letter] = !letterStatesClone[ndx][letter];
            setLetterStates(letterStatesClone);
            setUnscrambled(unscrambled + letter);
            if (unscrambled + letter === props.word) {
                setFinished(true);
                setShowWord(false);
            }
        }
    };

    const handleRefresh = e => {
        setLetterStates(initLetters(props.word));
        setFinished(false);
        setUnscrambled('');
        setScrambled(scramble(props.word));
    };

    const handleHint = e => {
        if (finished || hintInProgressRef.current) return;
        hintInProgressRef.current = true;

        // Clear any existing hinted classes
        const existingEls = Array.from(document.querySelectorAll('.letter'));
        existingEls.forEach(el => el.classList.remove('hinted'));

        const scrambledArr = scrambled.split('');
        const usedIndices = new Set();
        // Mark already-selected letters as used so hints don't reuse them
        letterStates.forEach((obj, idx) => {
            const letter = scrambledArr[idx];
            if (obj[letter]) usedIndices.add(idx);
        });

        const sequence = props.word.slice(unscrambled.length).split('');
        let delay = 0;
        const highlightDuration = 600; // ms each letter is highlighted

        sequence.forEach((target, seqIdx) => {
            // find first matching index that is not used
            let pos = -1;
            for (let i = 0; i < scrambledArr.length; i++) {
                if (scrambledArr[i] === target && !usedIndices.has(i)) {
                    pos = i;
                    break;
                }
            }
            if (pos === -1) return; // no available match
            usedIndices.add(pos);

            // schedule highlight
            const showTimeout = setTimeout(() => {
                const el = document.querySelector(`.letter[data-ndx="${pos}"]`);
                if (el) el.classList.add('hinted');
            }, delay);
            hintTimeoutsRef.current.push(showTimeout);

            // schedule remove
            const hideTimeout = setTimeout(() => {
                const el = document.querySelector(`.letter[data-ndx="${pos}"]`);
                if (el) el.classList.remove('hinted');
                // when last item processed, clear state
                if (seqIdx === sequence.length - 1) {
                    hintInProgressRef.current = false;
                    hintTimeoutsRef.current = [];
                }
            }, delay + highlightDuration);
            hintTimeoutsRef.current.push(hideTimeout);

            delay += highlightDuration + 150; // short pause between highlights
        });
    }

    useEffect(() => {
        return () => {
            // cleanup any pending timeouts on unmount
            if (hintTimeoutsRef.current && hintTimeoutsRef.current.length) {
                hintTimeoutsRef.current.forEach(tid => clearTimeout(tid));
                hintTimeoutsRef.current = [];
            }
        }
    }, []);

    const handleShowWord = e => {
        setShowWord(true);
    }

    return (
        <div className="scrambled-wrapper">

            {showWord ? (<div className="show-word">
                {props.word.split('').map((letter, key) => <span key={key}>{letter}</span>)}
            </div>) : null}

            <div className={'scrambled' + (finished ? ' finished' : '')}>
                {scrambled.split('').map((letter, key) => {
                    var className = 'letter';
                    if (letterStates[key][letter]) { className += ' selected'; }
                    return <span key={key} onClick={selectLetter} data-ndx={key} className={className}>{letter}</span>;
                })}
            </div>
            <div className={'unscrambled'}>
                {unscrambled.split('').map((letter, key) => <span key={key}>{letter}</span>)}
            </div>
        </div>
    );

}

export default Scramble;
