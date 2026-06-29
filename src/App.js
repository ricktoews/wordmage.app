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
    faHistory,
    faShareNodes
} from '@fortawesome/free-solid-svg-icons';

import KeyCapture from './KeyCapture';
// Import WordMageContext to set Context for app.
import { WordMageContext } from './WordMageContext';
import Login from './Login';
import { clearAuthenticatedToken } from './utils/auth';
import { createAnonymousUser, hasPendingAlbumClaim, loadUserWorkspace } from './utils/workspace';

// Import WordsInterface - data, utilities.
import WordsInterface from './utils/words-interface';

// Import components
import Hamburger from './components/Hamburger';
import ContextualHelp from './components/ContextualHelp';

import PopupAIExplain from './components/PopupAIExplain';
import Popup from './components/Popup';
import PopupListShare from './components/PopupListShare';
import UnscrambleGame from './components/UnscrambleGame';
import BrowseWords from './components/BrowseWords';
import CollectiveWords from './components/CollectiveWords';
import Train from './components/Train';
import Albums from './components/Albums';
import WordAlbum from './components/WordAlbum';
import SharedAlbum from './components/SharedAlbum';
import Random from './components/Random';
import Register from './Register';
import Profile from './Profile';
import About from './About';
import History from './components/History';

import './App.scss';

const ALBUM_THEMES = ['classic', 'paper', 'ink', 'arcane', 'eldritch', 'obsidian', 'fogbound'];
const GLOBAL_THEME_CLASSES = ALBUM_THEMES.map((theme) => `album-theme-global-${theme}`);
const CONTEXTUAL_HELP_HINTS = [
    {
        id: 'random-share-button-v1',
        target: '[data-contextual-help="random-share-button"]',
        title: 'Share your finds',
        text: 'Use this button to share the current collection of random words.'
    },
    {
        id: 'random-refresh-button-v1',
        target: '[data-contextual-help="random-refresh-button"]',
        title: 'Discover new words',
        text: 'Refresh the Random page whenever you want a fresh selection of words.'
    }
];

const getAlbumThemeFromStorage = () => {
    if (typeof window === 'undefined') {
        return 'classic';
    }

    const storedTheme = window.localStorage.getItem('wordmage.albumTheme');
    return ALBUM_THEMES.includes(storedTheme) ? storedTheme : 'classic';
};

function App(props) {
    const [aiExplainWord, setAiExplainWord] = useState(null);
    const [showAppSharePopup, setShowAppSharePopup] = useState(false);
    const [mastheadShareConfig, setMastheadShareConfig] = useState(null);

    // Set up Context for app. WordMageContext.Provider will wrap everything.
    const [contextValue, setContextValue] = useState({ targetEl: null });
    const [authUser, setAuthUser] = useState(null);
    const contextProviderValue = useMemo(() => ({ contextValue, setContextValue, authUser, setAuthUser }), [contextValue, setContextValue, authUser, setAuthUser]);
    const [activeUserId, setActiveUserId] = useState(() => {
        if (typeof window === 'undefined') {
            return null;
        }

        return localStorage.getItem('wordmage-profile-user_id') || localStorage.getItem('wordmage-anonymous-user_id');
    });
    const hasUserWorkspace = Boolean(activeUserId);

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

    useEffect(() => {
        const handleWorkspaceChanged = (event) => {
            const nextUserId = event?.detail?.userId || localStorage.getItem('wordmage-profile-user_id');
            setActiveUserId(nextUserId || null);
        };

        window.addEventListener('wordmage:workspaceChanged', handleWorkspaceChanged);

        return () => {
            window.removeEventListener('wordmage:workspaceChanged', handleWorkspaceChanged);
        };
    }, []);

    useEffect(() => {
        if (hasPendingAlbumClaim() && props.location.pathname !== '/login') {
            props.history.push('/login');
        }
    }, [props.history, props.location.pathname]);

    //---------------------------------------------
    const wordHash = WordsInterface.fullWordList();
    const [fullWordList, setFullWordList] = useState(wordHash);
    const [view, setView] = useState('Random');
    const [word, setWord] = useState('');
    const [hamburgerClass, setHamburgerClass] = useState('hamburger-nav');

    const [wordShareState, setWordShareState] = useState(false);

    const hamburgerRef = useRef(null);
    const accountRef = useRef(null);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

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
        setContextValue({ ...contextValue, targetEl: el });
    }

    useEffect(() => {
        document.addEventListener('click', handleDocumentClicked, true);
    }, []);

    useEffect(() => {
        const syncThemeUIFromStorage = (themeOverride) => {
            const theme = themeOverride || getAlbumThemeFromStorage();

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
            if (event.key === 'wordmage.albumTheme') {
                syncThemeUIFromStorage();
            }
        };

        // Re-sync on route changes so theme classes remain applied outside WordAlbum.
        syncThemeUIFromStorage();

        window.addEventListener('wordmage:albumThemeChanged', handleAlbumThemeChanged);
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener('wordmage:albumThemeChanged', handleAlbumThemeChanged);
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

    const signOut = async () => {
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
        try {
            localStorage.setItem('wordmage.hasAuthenticatedBefore', 'true');
            localStorage.removeItem('authUser');
            localStorage.removeItem('wordmage-profile-email');
            localStorage.removeItem('wordmage-profile-user_id');
            localStorage.removeItem('wordmage-anonymous-user_id');
            localStorage.removeItem('wordmage-anonymous-token');
            WordsInterface.initializeCustom({});
            WordsInterface.setFavoriteWords([]);
            clearAuthenticatedToken();
            const nextUserId = await createAnonymousUser();
            await loadUserWorkspace(nextUserId);
            setActiveUserId(String(nextUserId));
            window.dispatchEvent(new CustomEvent('wordmage:workspaceChanged', {
                detail: { userId: String(nextUserId) }
            }));
            props.history.push('/random');
        } catch (e) {
            console.error('Failed to switch to anonymous workspace:', e);
        }
    }

    const toggleAccountMenu = () => {
        setAccountMenuOpen(prev => !prev);
    }

    const handleMastheadShare = () => {
        if (mastheadShareConfig?.onShare) {
            mastheadShareConfig.onShare();
            return;
        }

        setShowAppSharePopup(true);
    };

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
                    {hasUserWorkspace && <li onClick={navToFavoritesList}><FontAwesomeIcon icon={faThumbsUp} /> Favorites</li>}
                    <li onClick={navToBrowseWords}><FontAwesomeIcon icon={faGlasses} /> Browse</li>
                    {hasUserWorkspace && <li onClick={navToAlbums}><FontAwesomeIcon icon={faFolderOpen} /> Albums</li>}
                    {hasUserWorkspace && <li onClick={navToHistory}><FontAwesomeIcon icon={faHistory} /> History</li>}
                    <li onClick={navToProfile}><FontAwesomeIcon icon={faUser} /> Settings</li>
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
                            src="/images/wordmage-logo.png"
                            alt="WordMage"
                            className="masthead-emblem"
                        />
                    </button>
                </div>                <div className="header-content">
                </div>

                <div className="header-nav-buttons">
                    <button className="header-nav-btn" onClick={navToRandom} title="Random">
                        <FontAwesomeIcon icon={faRandom} />
                    </button>
                    <button className="header-nav-btn" onClick={navToBrowseWords} title="Browse">
                        <FontAwesomeIcon icon={faGlasses} />
                    </button>
                    {hasUserWorkspace && (
                        <button className="header-nav-btn" onClick={navToFavoritesList} title="Favorites">
                            <FontAwesomeIcon icon={faThumbsUp} />
                        </button>
                    )}
                    {hasUserWorkspace && (
                        <button className="header-nav-btn" onClick={navToAlbums} title="Albums">
                            <FontAwesomeIcon icon={faFolderOpen} />
                        </button>
                    )}
                    <button
                        className="header-nav-btn"
                        onClick={handleMastheadShare}
                        title={mastheadShareConfig?.title || 'Share WordMage'}
                        aria-label={mastheadShareConfig?.ariaLabel || mastheadShareConfig?.title || 'Share WordMage'}
                        disabled={mastheadShareConfig?.disabled || false}
                        data-contextual-help={mastheadShareConfig?.contextualHelpId}
                    >
                        <FontAwesomeIcon icon={faShareNodes} />
                    </button>
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

            <ContextualHelp hints={CONTEXTUAL_HELP_HINTS} />

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

                <Popup
                    isVisible={showAppSharePopup}
                    handleBackgroundClick={() => setShowAppSharePopup(false)}
                    className="list-share-popup"
                >
                    <PopupListShare title="Share WordMage" label="WordMage" showWordListOptions={false} />
                </Popup>

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
                        <Route path="/shared/albums/:token" render={props => (<SharedAlbum />)} />
                        <Route exact path="/albums" render={props => (<Albums
                            key={`albums-${activeUserId || 'none'}`}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route path="/albums/:id" render={props => (<WordAlbum
                            key={`album-${activeUserId || 'none'}-${props.match.params.id}`}
                            onAIExplain={handleAIExplain}
                            setMastheadShareConfig={setMastheadShareConfig}
                        />)} />
                        <Route exact path="/history" render={props => (<History />)} />
                        <Route exact path={['/', '/random']} render={props => (<Random
                            key={`random-${activeUserId || 'none'}`}
                            onAIExplain={handleAIExplain}
                            setMastheadShareConfig={setMastheadShareConfig}
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
