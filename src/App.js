import { Fab, Webchat } from '@botpress/webchat'

import { useEffect, useState, useRef, useContext, useMemo } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRandom,
    faThumbsUp,
    faGlasses,
    faFolderOpen,
    faGraduationCap,
    faRetweet,
    faBook,
    faHome,
    faUser,
    faComment,
    faHistory
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

import PopupAIExplain from './components/PopupAIExplain';
import Popup from './components/Popup';
import UnscrambleGame from './components/UnscrambleGame';
import BrowseWords from './components/BrowseWords';
import CollectiveWords from './components/CollectiveWords';
import Train from './components/Train';
import Albums from './components/Albums';
import WordAlbum from './components/WordAlbum';
import Random from './components/Random';
import Register from './Register';
import Profile from './Profile';
import About from './About';
import History from './components/History';

import './App.scss';

const EMBLEM_NAMES = ['book', 'compass', 'key', 'lamp', 'owl', 'quill'];
const THEME_TO_EMBLEM = {
    classic: 'book',
    paper: 'quill',
    ink: 'owl',
    arcane: 'lamp',
    eldritch: 'compass',
    obsidian: 'key',
    fogbound: 'lamp'
};
const GLOBAL_THEME_CLASSES = Object.keys(THEME_TO_EMBLEM).map((theme) => `album-theme-global-${theme}`);

const getAlbumThemeFromStorage = () => {
    if (typeof window === 'undefined') {
        return 'classic';
    }

    const storedTheme = window.localStorage.getItem('wordmage.albumTheme');
    return Object.prototype.hasOwnProperty.call(THEME_TO_EMBLEM, storedTheme) ? storedTheme : 'classic';
};

const getEmblemOverrideFromStorage = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    const override = window.localStorage.getItem('wordmage.mastheadEmblem');
    return EMBLEM_NAMES.includes(override) ? override : null;
};

const resolveMastheadEmblem = (theme) => {
    const override = getEmblemOverrideFromStorage();
    if (override) {
        return override;
    }

    return THEME_TO_EMBLEM[theme] || 'book';
};

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
    const [mastheadEmblem, setMastheadEmblem] = useState(() => resolveMastheadEmblem(getAlbumThemeFromStorage()));
    const [view, setView] = useState('Random');
    const [word, setWord] = useState('');
    const [hamburgerClass, setHamburgerClass] = useState('hamburger-nav');

    const [wordShareState, setWordShareState] = useState(false);

    const hamburgerRef = useRef(null);
    const accountRef = useRef(null);
    const webchatRef = useRef(null);
    const webchatButtonRef = useRef(null);
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
                if (webchatButtonRef.current && !webchatButtonRef.current.contains(el)) {
                    setIsWebchatOpen(false);
                }
            }
        } catch (e) { }
        setContextValue({ ...contextValue, targetEl: el });
    }

    useEffect(() => {
        document.addEventListener('click', handleDocumentClicked, true);
    }, []);

    useEffect(() => {
        const syncThemeUIFromStorage = (themeOverride) => {
            const theme = themeOverride || getAlbumThemeFromStorage();
            setMastheadEmblem(resolveMastheadEmblem(theme));

            if (typeof document !== 'undefined') {
                const { body } = document;
                body.classList.add('album-theme-global-active');
                GLOBAL_THEME_CLASSES.forEach((themeClass) => body.classList.remove(themeClass));
                body.classList.add(`album-theme-global-${theme}`);
            }
        };

        const handleAlbumThemeChanged = (event) => {
            const nextTheme = event?.detail?.theme;
            syncThemeUIFromStorage(nextTheme);
        };

        const handleStorage = (event) => {
            if (event.key === 'wordmage.albumTheme' || event.key === 'wordmage.mastheadEmblem') {
                syncThemeUIFromStorage();
            }
        };

        const handleMastheadEmblemChanged = () => {
            syncThemeUIFromStorage();
        };

        // Re-sync on route changes so theme classes remain applied outside WordAlbum.
        syncThemeUIFromStorage();

        window.addEventListener('wordmage:albumThemeChanged', handleAlbumThemeChanged);
        window.addEventListener('wordmage:mastheadEmblemChanged', handleMastheadEmblemChanged);
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener('wordmage:albumThemeChanged', handleAlbumThemeChanged);
            window.removeEventListener('wordmage:mastheadEmblemChanged', handleMastheadEmblemChanged);
            window.removeEventListener('storage', handleStorage);
        };
    }, [props.location.pathname]);

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

    const navToAlbums = () => {
        var history = props.history;
        history.push('/albums');
        setView('Albums');
        setHamburgerClass('hamburger-nav');
    }
    const navToProfile = () => {
        var history = props.history;
        history.push('/settings');
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

    const navToHistory = () => {
        var history = props.history;
        history.push('/history');
        setView('History');
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
                    {authUser && <li onClick={navToAlbums}><FontAwesomeIcon icon={faFolderOpen} /> Albums</li>}
                    {authUser && <li onClick={navToHistory}><FontAwesomeIcon icon={faHistory} /> History</li>}
                    {authUser && <li onClick={navToProfile}><FontAwesomeIcon icon={faUser} /> Settings</li>}
                    <li onClick={navToAbout}><FontAwesomeIcon icon={faHome} /> About</li>
                </ul>
            </nav>

            <header className="App-header">
                <div className="hamburger-icon-container">
                    <button
                        type="button"
                        className="hamburger-icon masthead-emblem-button"
                        onClick={hamburgerClick}
                        title="Open navigation menu"
                        aria-label="Open navigation menu"
                    >
                        <img
                            src={`/images/wordmage_solid_emblems_svg/solid-${mastheadEmblem}.svg`}
                            alt="WordMage emblem"
                            className="masthead-emblem"
                        />
                    </button>
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
                    {authUser && (
                        <button className="header-nav-btn" onClick={navToAlbums} title="Albums">
                            <FontAwesomeIcon icon={faFolderOpen} />
                        </button>
                    )}
                    {authUser && (
                        <button className="header-nav-btn" onClick={navToHistory} title="History">
                            <FontAwesomeIcon icon={faHistory} />
                        </button>
                    )}
                    {/* {authUser && (
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
                                    <button
                                        className="account-menu-item"
                                        onClick={() => { setAccountMenuOpen(false); navToProfile(); }}
                                    >
                                        Settings
                                    </button>
                                    <button className="account-menu-item" onClick={() => { setAccountMenuOpen(false); signOut(); }}>Sign out</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <WordMageContext.Provider value={contextProviderValue}>
                {aiExplainWord && (
                    <Popup isVisible={true} handleBackgroundClick={() => setAiExplainWord(null)}>
                        <PopupAIExplain
                            word={aiExplainWord.word}
                            definition={aiExplainWord.definition}
                            onClose={() => setAiExplainWord(null)}
                        />
                    </Popup>
                )}

                {botpressClientId && isWebchatOpen && (
                    <div ref={webchatRef} className="add-word-icon-container">
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
                    </div>
                )}

                <KeyCapture>
                    <Switch>
                        <Route exact path={['/unscramble/:word/:def']} render={props => <UnscrambleGame />} />
                        <Route exact path={['/what-to-train']} render={props => (<Train
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path={['/training-room']} render={props => (<Train
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path={['/what-to-train']} render={props => (<Train
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path={['/training-room']} render={props => (<Train
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path='/unscramble/:word' render={props => <UnscrambleGame />} />
                        <Route exact path='/unscramble' render={props => <UnscrambleGame />} />
                        <Route path="/browse/:start?" render={props => (<BrowseWords
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route path="/collective/:start?" render={props => (<CollectiveWords
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path="/albums" render={props => (<Albums
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route path="/albums/:id" render={props => (<WordAlbum
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path="/history" render={props => (<History />)} />
                        <Route exact path={['/', '/random']} render={props => (<Random
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route path="/settings" component={Profile} />
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
