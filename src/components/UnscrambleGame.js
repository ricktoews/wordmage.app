import { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faLightbulb, faForward } from '@fortawesome/free-solid-svg-icons';
import OpenCloseIcon from './icons/OpenCloseIcon';
import RefreshIcon from './icons/RefreshIcon';
import WordsInterface from '../utils/words-interface';
import { CONFIG } from '../config';
import { authFetch } from '../utils/auth';
import Scramble from './Scramble';

function pickRandom(pool) {
    if (!pool || pool.length === 0) return { word: '', def: '' };
    const ndx = Math.floor(Math.random() * pool.length);
    const w = pool[ndx];
    return {
        id: w.id || w.word_id || null,
        word: w.word,
        def: w.definition || w.def || ''
    };
}

function UnscrambleGame(props) {
    const [introMessage, setIntroMessage] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [hintTrigger, setHintTrigger] = useState(0);
    const [favoritesPool, setFavoritesPool] = useState([]);
    const poolRef = useRef([]);
    const attemptRef = useRef({
        wordId: null,
        hintsRequested: 0,
        showWordRequested: false,
        incorrectOrderCount: 0,
        letterAttempts: 0,
        submitted: false,
        solved: false
    });

    // Check state for selected scrambled word.
    const state = props.location.state;
    // Check for word passed via URL.
    const likedWord = props.match?.params?.word;

    const getInitialItem = () => {
        if (likedWord) return WordsInterface.getWordObjByWord(likedWord);
        if (state?.wordObj) return state.wordObj;
        return { word: '', def: '' }; // will be set after fetch
    };
    const [item, setItem] = useState(getInitialItem);

    const resetAttemptForItem = (nextItem) => {
        attemptRef.current = {
            wordId: nextItem?.id || nextItem?.word_id || null,
            hintsRequested: 0,
            showWordRequested: false,
            incorrectOrderCount: 0,
            letterAttempts: 0,
            submitted: false,
            solved: false
        };
    };

    const submitAttempt = async (result) => {
        const attempt = attemptRef.current;
        if (!attempt || attempt.submitted) {
            return;
        }

        const wordId = attempt.wordId || item?.id || item?.word_id;
        if (!wordId) {
            return;
        }

        attempt.submitted = true;

        try {
            await authFetch(`${CONFIG.domain}/user-word-learning/unscramble-attempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    word_id: wordId,
                    result
                })
            });
        } catch (error) {
            console.error('Failed to submit unscramble attempt:', error);
        }
    };

    const classifyIncompleteAttempt = () => {
        const attempt = attemptRef.current;
        if (!attempt) {
            return 'skipped';
        }

        if (attempt.showWordRequested) {
            return 'revealed';
        }

        if (attempt.hintsRequested > 0) {
            return 'hint';
        }

        const hadEffort =
            attempt.letterAttempts > 0 ||
            attempt.incorrectOrderCount > 0;

        return hadEffort ? 'failed' : 'skipped';
    };

    useEffect(() => {
        if (props.match.params.word && props.match.params.def) {
            let { word, def } = props.match.params;
            WordsInterface.saveCustomWord(-1, word, def);
            props.history.push('/favorites');
            return;
        }
        // If a specific word was provided, no need to fetch pool.
        if (likedWord || state?.wordObj) return;

        // Fetch Favorites album words.
        const albumIds = WordsInterface.getAlbumIds();
        const favoritesId = albumIds?.Favorites;
        if (!favoritesId) {
            setIntroMessage('Add words to your Favorites to play Unscramble.');
            return;
        }
        authFetch(`${CONFIG.domain}/albums/${favoritesId}/unscramble-queue`)
            .then(res => res.json())
            .then(data => {
                const words = Array.isArray(data) ? data : (data.words || []);
                poolRef.current = words;
                setFavoritesPool(words);
                if (words.length === 0) {
                    setIntroMessage('Add words to your Favorites to play Unscramble.');
                } else {
                    const nextItem = pickRandom(words);
                    resetAttemptForItem(nextItem);
                    setItem(nextItem);
                }
            })
            .catch(() => {
                setIntroMessage('Could not load Favorites. Please try again.');
            });
    }, []);

    useEffect(() => {
        if (!item?.word) {
            return;
        }

        resetAttemptForItem(item);
    }, [item?.id, item?.word]);

    const handleAnother = () => {
        if (!attemptRef.current.submitted && item?.word) {
            submitAttempt(classifyIncompleteAttempt());
        }
        setItem(pickRandom(poolRef.current));
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleHint = () => {
        attemptRef.current.hintsRequested += 1;
        setHintTrigger(prev => prev + 1);
    };

    const handleSolved = () => {
        attemptRef.current.solved = true;
        if (!attemptRef.current.submitted && item?.word) {
            const result = attemptRef.current.hintsRequested > 0 ? 'hint' : 'correct';
            submitAttempt(result);
        }
    };

    const handleLetterAttempt = ({ isCorrectOrder }) => {
        attemptRef.current.letterAttempts += 1;
        if (!isCorrectOrder) {
            attemptRef.current.incorrectOrderCount += 1;
        }
    };

    return (
        <div className="unscramble-container">
            {item.word > '' ? (
                <div className="unscramble-wrapper">
                    <div className="unscramble-toolbar">
                        <div className="unscramble-toolbar-title">Unscramble</div>
                        <div className="unscramble-toolbar-buttons">
                            <RefreshIcon onClick={handleRefresh} />
                            <button className="badge" onClick={handleHint} title="Hint"><FontAwesomeIcon icon={faLightbulb} /></button>
                            <button className="badge" onClick={handleAnother} title="Another"><FontAwesomeIcon icon={faForward} /></button>
                        </div>
                    </div>

                    <div className="unscramble-definition-card">
                        <div className="word-item-def">
                            {item.def}
                        </div>
                    </div>

                    <div className="scramble">
                        <Scramble
                            item={item}
                            word={item.word}
                            refreshTrigger={refreshTrigger}
                            hintTrigger={hintTrigger}
                            onSolved={handleSolved}
                            onLetterAttempt={handleLetterAttempt}
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

export default withRouter(UnscrambleGame);
