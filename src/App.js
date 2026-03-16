import { Fab, Webchat } from '@botpress/webchat'

import { useEffect, useState, useRef, useContext, useMemo } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMasksTheater,
    faRandom,
    faThumbsUp,
    faGlasses,
    faFolderOpen,
    faLeaf,
    faGraduationCap,
    faRetweet,
    faBook,
    faHome,
    faUser
} from '@fortawesome/free-solid-svg-icons';

import KeyCapture from './KeyCapture';
// Import WordMageContext to set Context for app.
import { WordMageContext } from './WordMageContext';
import Login from './Login';
import { CONFIG } from './config';

// Import WordsInterface - data, utilities.
import WordsInterface from './utils/words-interface';

// Import components
import Hamburger from './components/Hamburger';
import WMLogo from './components/icons/WMLogo';
import AddIcon from './components/icons/AddIcon';
import PopupWordForm from './components/PopupWordForm';
import PopupAIExplain from './components/PopupAIExplain';
import Popup from './components/Popup';
import UnscrambleGame from './components/UnscrambleGame';
import BrowseWords from './components/BrowseWords';
import CollectiveWords from './components/CollectiveWords';
import Train from './components/Train';
import Moods from './components/Moods';
import Albums from './components/Albums';
import WordAlbum from './components/WordAlbum';
import Random from './components/Random';
import Register from './Register';
import Profile from './Profile';
import About from './About';

import './App.scss';

function App(props) {
    const [aiExplainWord, setAiExplainWord] = useState(null);
    const [isWebchatOpen, setIsWebchatOpen] = useState(false);
    const [botpressClientId, setBotpressClientId] = useState(null);

    const toggleWebchat = () => {
        setIsWebchatOpen((prevState) => !prevState)
    }

    // Set up Context for app. WordMageContext.Provider will wrap everything.
    const [contextValue, setContextValue] = useState({ targetEl: null });
    const [authUser, setAuthUser] = useState(null);
    const contextProviderValue = useMemo(() => ({ contextValue, setContextValue, authUser, setAuthUser }), [contextValue, setContextValue, authUser, setAuthUser]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('authUser');
            if (stored) {
                setAuthUser(JSON.parse(stored));
            }
        } catch (err) {
            console.warn('Error reading authUser from localStorage', err);
        }
    }, []);

    //---------------------------------------------
    const wordHash = WordsInterface.fullWordList();
    const [fullWordList, setFullWordList] = useState(wordHash);
    const [view, setView] = useState('Random');
    const [word, setWord] = useState('');
    const [wordId, setWordId] = useState(0);
    const [hamburgerClass, setHamburgerClass] = useState('hamburger-nav');

    const [wordFormState, setWordFormState] = useState(false);
    const [wordShareState, setWordShareState] = useState(false);

    const hamburgerRef = useRef(null);
    const accountRef = useRef(null);
    const webchatRef = useRef(null);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

    useEffect(() => {
        fetch('/.netlify/functions/botpress')
            .then((res) => res.json())
            .then((data) => {
                const clientId = data.clientId;
                setBotpressClientId(clientId);
            })
            .catch((error) => {
                console.error('Error fetching environment variable:', error);
            });
    }, []);

    const handleDocumentClicked = e => {
        // Check if clicked outside hambuger menu.
        var el = e.target;
        var elClass = Array.from(el.classList);
        var parentElClass = Array.isArray(el.parentNode?.classList) ? Array.from(el.parentNode.classList) : [];
        if (elClass.indexOf('hamburger-icon') === -1 && parentElClass.indexOf('hamburger-icon') === -1) {
            if (!hamburgerRef.current.contains(el)) {
                setHamburgerClass('hamburger-nav');
            }
        }
        // Close account menu if clicking outside it
        try {
            if (accountRef.current && !accountRef.current.contains(el)) {
                setAccountMenuOpen(false);
            }
        } catch (e) { }
        // Close webchat if clicking outside it
        try {
            if (webchatRef.current && !webchatRef.current.contains(el)) {
                // Don't close if clicking the webchat toggle button
                if (!elClass.includes('badge-botpress') && !parentElClass.includes('badge-botpress')) {
                    setIsWebchatOpen(false);
                }
            }
        } catch (e) { }
        setContextValue({ ...contextValue, targetEl: el });
    }

    useEffect(() => {
        document.addEventListener('click', handleDocumentClicked, true);
    }, []);

    const navToRandom = () => {
        var history = props.history;
        history.push('/random');
        setView('Random');
        setHamburgerClass('hamburger-nav');
    }

    const navToBrowseWords = () => {
        var history = props.history;
        history.push('/browse');
        setView('Browse');
        setHamburgerClass('hamburger-nav');
    }

    const navToUnscramble = () => {
        var history = props.history;
        history.push('/unscramble');
        setView('Solve');
        setHamburgerClass('hamburger-nav');
    }

    const navToFavoritesList = () => {
        var history = props.history;
        const albumIds = WordsInterface.getAlbumIds();
        const favoritesAlbumId = albumIds.Favorites;
        if (favoritesAlbumId) {
            history.push(`/albums/${favoritesAlbumId}`);
            setView('Favorites');
        } else {
            history.push('/albums');
            setView('Albums');
        }
        setHamburgerClass('hamburger-nav');
    }

    const navToLearn = () => {
        var history = props.history;
        const albumIds = WordsInterface.getAlbumIds();
        const learnAlbumId = albumIds.Learn;
        if (learnAlbumId) {
            history.push(`/albums/${learnAlbumId}`);
            setView('Learn');
        } else {
            history.push('/albums');
            setView('Albums');
        }
        setHamburgerClass('hamburger-nav');
    }

    const navToTrain = () => {
        var history = props.history;
        history.push('/training-room');
        setView('TrainingRoom');
        setHamburgerClass('hamburger-nav');
    }

    const navToTrainingRoom = () => {
        var history = props.history;
        history.push('/training-room');
        setView('TrainingRoom');
        setHamburgerClass('hamburger-nav');
    }

    const navToCollective = () => {
        var history = props.history;
        history.push('/collective');
        setView('Collective');
        setHamburgerClass('hamburger-nav');
    }

    const navToMoods = () => {
        var history = props.history;
        history.push('/moods');
        setView('Moods');
        setHamburgerClass('hamburger-nav');
    }
    const navToAlbums = () => {
        var history = props.history;
        history.push('/albums');
        setView('Albums');
        setHamburgerClass('hamburger-nav');
    }
    const navToProfile = () => {
        var history = props.history;
        history.push('/profile');
        setView('Profile');
        setHamburgerClass('hamburger-nav');
    }

    const navToRegister = () => {
        var history = props.history;
        history.push('/register');
        setView('Register');
        setHamburgerClass('hamburger-nav');
    }

    const navToAbout = () => {
        var history = props.history;
        history.push('/about');
        setView('About');
        setHamburgerClass('hamburger-nav');
    }

    const navToLogin = () => {
        var history = props.history;
        history.push('/login');
        setView('Login');
        setHamburgerClass('hamburger-nav');
    }

    const signOut = () => {
        // Attempt to disable Google auto-select / revoke if available
        try {
            if (window.google && window.google.accounts && window.google.accounts.id) {
                // Disable auto-select for One Tap
                try { window.google.accounts.id.disableAutoSelect(); } catch (e) { }
                // Try revoke by email (best-effort)
                try { if (authUser && authUser.email) window.google.accounts.id.revoke(authUser.email, () => { }); } catch (e) { }
            }
        } catch (e) { }
        setAuthUser(null);
        try { localStorage.clear(); } catch (e) { }
    }

    const toggleAccountMenu = () => {
        setAccountMenuOpen(prev => !prev);
    }

    const hamburgerClick = () => {
        console.log('hamburger clicked', hamburgerClass);
        if (hamburgerClass === 'hamburger-nav') {
            setHamburgerClass('hamburger-nav hamburger-on');
        } else {
            setHamburgerClass('hamburger-nav');
        }
    };

    const popupWordForm = wordId => {
        setWordId(wordId);
        setWordFormState(true);
    }

    const cancelWordForm = () => {
        setWordFormState(false);
    }

    const saveWordForm = () => {
        setWordFormState(false);
    }

    const handleBackgroundClick = () => {
        setWordFormState(false);
    }

    const handleAIExplain = (word, definition) => {
        setAiExplainWord({ word, definition });
        console.log(`AI Explain requested for: ${word}`);
    }

    return (
        <div className="App">

            <nav ref={hamburgerRef} className={hamburgerClass}>
                <ul>
                    <li onClick={navToRandom}><FontAwesomeIcon icon={faRandom} /> Random</li>
                    {authUser && <li onClick={navToFavoritesList}><FontAwesomeIcon icon={faThumbsUp} /> Favorites</li>}
                    <li onClick={navToBrowseWords}><FontAwesomeIcon icon={faGlasses} /> Browse</li>
                    <li onClick={navToMoods}><FontAwesomeIcon icon={faMasksTheater} /> Moods</li>
                    {authUser && <li onClick={navToAlbums}><FontAwesomeIcon icon={faFolderOpen} /> Albums</li>}
                    {authUser && <li onClick={navToLearn}><FontAwesomeIcon icon={faLeaf} /> Learn</li>}
                    {authUser && <li onClick={navToTrain}><FontAwesomeIcon icon={faGraduationCap} /> Train</li>}
                    {authUser && <li onClick={navToUnscramble}><FontAwesomeIcon icon={faRetweet} /> Unscramble</li>}
                    <li onClick={navToCollective}><FontAwesomeIcon icon={faBook} /> Collective</li>
                    <li onClick={navToAbout}><FontAwesomeIcon icon={faHome} /> About</li>
                </ul>
            </nav>

            <header className="App-header">
                <div className="hamburger-icon-container">
                    <WMLogo onClick={hamburgerClick} />
                </div>                <div className="header-content">
                </div>

                <div className="header-nav-buttons">
                    <button className="header-nav-btn" onClick={navToRandom} title="Random">
                        <FontAwesomeIcon icon={faRandom} />
                    </button>
                    {authUser && (
                        <button className="header-nav-btn" onClick={navToFavoritesList} title="Favorites">
                            <FontAwesomeIcon icon={faThumbsUp} />
                        </button>
                    )}
                    <button className="header-nav-btn" onClick={navToBrowseWords} title="Browse">
                        <FontAwesomeIcon icon={faGlasses} />
                    </button>
                    <button className="header-nav-btn" onClick={navToMoods} title="Moods">
                        <FontAwesomeIcon icon={faMasksTheater} />
                    </button>
                    {authUser && (
                        <button className="header-nav-btn" onClick={navToAlbums} title="Albums">
                            <FontAwesomeIcon icon={faFolderOpen} />
                        </button>
                    )}
                    {/* {authUser && (
                        <button className="header-nav-btn" onClick={navToLearn} title="Learn">
                            <FontAwesomeIcon icon={faLeaf} />
                        </button>
                    )}
                    {authUser && (
                        <button className="header-nav-btn" onClick={navToTrain} title="Train">
                            <FontAwesomeIcon icon={faGraduationCap} />
                        </button>
                    )} */}
                </div>

                <div className="header-right">
                    {!authUser ? (
                        <button className="header-login-btn" onClick={navToLogin} title="Log In">
                            <FontAwesomeIcon icon={faUser} />
                        </button>
                    ) : (
                        <div className="account-wrapper" ref={accountRef}>
                            <button className="account-button" onClick={toggleAccountMenu} aria-haspopup="true" aria-expanded={accountMenuOpen}>
                                {authUser.avatarUrl ? (
                                    <img className="account-avatar" src={authUser.avatarUrl} alt={authUser.name || 'Account'} />
                                ) : (
                                    <div className="account-initial">{(authUser.name || authUser.email || 'U')[0].toUpperCase()}</div>
                                )}
                            </button>
                            {accountMenuOpen && (
                                <div className="account-menu" role="menu">
                                    <button className="account-menu-item" onClick={() => { setAccountMenuOpen(false); signOut(); }}>Sign out</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <WordMageContext.Provider value={contextProviderValue}>
                <Popup isVisible={wordFormState} handleBackgroundClick={handleBackgroundClick}><PopupWordForm wordId={wordId} cancelWordForm={cancelWordForm} saveWordForm={saveWordForm} /></Popup>

                {aiExplainWord && (
                    <Popup isVisible={true} handleBackgroundClick={() => setAiExplainWord(null)}>
                        <PopupAIExplain
                            word={aiExplainWord.word}
                            definition={aiExplainWord.definition}
                            onClose={() => setAiExplainWord(null)}
                        />
                    </Popup>
                )}

                {props.location.pathname.startsWith('/browse') && (
                    <>
                        {botpressClientId && isWebchatOpen && (<div ref={webchatRef} className="add-word-icon-container">
                            <Webchat
                                clientId={botpressClientId}
                                configuration={{ botName: 'WordMage Wizard' }}
                                style={{
                                    width: '300px',
                                    height: '400px',
                                    display: 'flex',
                                    position: 'fixed',
                                    bottom: '90px',
                                    right: '20px',
                                }}
                            />
                        </div>)}
                    </>
                )}

                <KeyCapture>
                    <Switch>
                        <Route exact path={['/unscramble/:word/:def']} render={props => <UnscrambleGame
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                        />} />
                        <Route exact path={['/what-to-train']} render={props => (<Train
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path={['/training-room']} render={props => (<Train
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path={['/what-to-train']} render={props => (<Train
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path={['/training-room']} render={props => (<Train
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path='/unscramble/:word' render={props => <UnscrambleGame
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                        />} />
                        <Route exact path='/unscramble' render={props => <UnscrambleGame
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                        />} />
                        <Route path="/browse/:start?" render={props => (<BrowseWords
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            botpressButton={botpressClientId}
                            toggleWebchat={toggleWebchat}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route path="/collective/:start?" render={props => (<CollectiveWords
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route path={["/moods", "/mood/:slug"]} render={props => (<Moods
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path="/albums" render={props => (<Albums
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route path="/albums/:id" render={props => (<WordAlbum
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path={['/', '/random']} render={props => (<Random
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route path="/profile" component={Profile} />
                        <Route path="/login" component={Login} />
                        <Route path="/register" component={Register} />
                        <Route path="/about" component={About} />
                    </Switch>
                </KeyCapture>
            </WordMageContext.Provider>

        </div >
    );
}

export default withRouter(App);
