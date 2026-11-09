import { useEffect, useState, useRef, useContext, useMemo, useCallback } from 'react';
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
    faShareNodes,
    faBars
} from '@fortawesome/free-solid-svg-icons';

import KeyCapture from './KeyCapture';
// Import WordMageContext to set Context for app.
import { WordMageContext } from './WordMageContext';
import Login from './Login';
import AssistantLink from './AssistantLink';
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
import PageMetadata from './components/PageMetadata';
import CollectiveWords from './components/CollectiveWords';
import LandingPage from './public-content/LandingPage';
import HeaderMock from './mock/HeaderMock';
import { PublicContent } from './public-content/PublicContent';
import Train from './components/Train';
import Albums from './components/Albums';
import WordAlbum from './components/WordAlbum';
import SharedAlbum from './components/SharedAlbum';
import Random from './components/Random';
import Register from './Register';
import Profile from './Profile';
import About from './About';
import History from './components/History';
import Inbox from './components/Inbox';
import NewWords from './components/NewWords';
import { ADMIN_ID } from './config';
import { getInboxWords } from './utils/api';
import { navigatePublicLink } from './utils/public-navigation';

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
    const isEditorialLanding = ['/rare-words', '/gothic-vocabulary'].includes(props.location.pathname.replace(/\/+$/, ''));
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
    const isAdmin = Number(activeUserId) === ADMIN_ID;
    const [inboxWords, setInboxWords] = useState([]);
    const [inboxLoading, setInboxLoading] = useState(false);
    const [inboxError, setInboxError] = useState(null);
    const hasInboxWords = isAdmin && inboxWords.length > 0;
    const hasUnreadInboxWords = isAdmin && inboxWords.some(word =>
        Number(word.inbox) === 1 && !Number(word.inbox_read)
    );
    const handleInboxMarkedRead = useCallback(() => {
        setInboxWords(words => words.map(word => ({ ...word, inbox_read: 1 })));
    }, []);

    useEffect(() => {
        let cancelled = false;
        setInboxWords([]);
        setInboxError(null);
        setInboxLoading(isAdmin);
        if (isAdmin) {
            getInboxWords()
                .then(words => { if (!cancelled) setInboxWords(words); })
                .catch(error => {
                    if (!cancelled) setInboxError('Unable to load inbox words. Please try reloading WordMage.');
                    console.error('Error loading inbox words:', error);
                })
                .finally(() => { if (!cancelled) setInboxLoading(false); });
        }
        return () => { cancelled = true; };
    }, [isAdmin, activeUserId]);

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
    const isMenuOpen = hamburgerClass.includes('hamburger-on');

    useEffect(() => {
        if (!isMenuOpen) return undefined;
        const handleEscape = event => {
            if (event.key === 'Escape') {
                setHamburgerClass('hamburger-nav');
                document.querySelector('[data-landing-menu-toggle]')?.focus();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isMenuOpen]);

    const handleDocumentClicked = e => {
        // Check if clicked outside hambuger menu.
        var el = e.target;
        if (!el.closest?.('.hamburger-icon')) {
            if (!hamburgerRef.current?.contains(el)) {
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

    const navToNewWords = () => {
        props.history.push('/new-words');
        setView('NewWords');
        setHamburgerClass('hamburger-nav');
    };

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

    if (props.location.pathname.replace(/\/+$/, '') === '/mock') {
        return <><PageMetadata /><HeaderMock user={authUser} /></>;
    }

    return (
        <div className={`App${isEditorialLanding ? ' editorial-layout' : ' workspace-layout'}`} onClick={event => navigatePublicLink(event, props.history)}>

            <nav ref={hamburgerRef} className={hamburgerClass} aria-label="Main navigation"
                aria-hidden={!isMenuOpen} inert={!isMenuOpen ? '' : undefined}>
                <div className="editorial-menu-heading"><span>Explore WordMage</span><button type="button" aria-label="Close navigation menu" onClick={() => setHamburgerClass('hamburger-nav')}>×</button></div>
                <ul className="editorial-menu-links">
                    {[
                        ['/', 'Random', '↝', navToRandom],
                        ['/browse', 'Browse', 'A–Z', navToBrowseWords],
                        ...(hasUserWorkspace ? [
                            [WordsInterface.getAlbumIds().Favorites ? `/albums/${WordsInterface.getAlbumIds().Favorites}` : '/albums', 'Favorites', '♥', navToFavoritesList],
                            ['/albums', 'Albums', '▱', navToAlbums]
                        ] : []),
                        [null, 'discovery'],
                        ['/rare-words', 'Rare Words', 'Aa'],
                        ['/gothic-vocabulary', 'Gothic', '☾'],
                        [null, 'workspace'],
                        ['/new-words', 'New Words', '+', navToNewWords],
                        ['/settings', 'Settings', '⚙', navToProfile],
                        ['/about', 'About', '?', navToAbout]
                    ].map(([href, label, glyph, action]) => !href ? <li key={label} role="separator" className="editorial-menu-separator" /> : <li key={label}><a href={href} data-public-link
                        aria-current={(props.location.pathname === href || (href === '/' && props.location.pathname === '/random')) ? 'page' : undefined}
                        onClick={event => { if (action && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); action(); } setHamburgerClass('hamburger-nav'); }}>
                        <span className="editorial-menu-glyph" aria-hidden="true">{glyph}</span><span>{label}</span>
                    </a></li>)}
                </ul>
            </nav>
            {isMenuOpen && <button className="editorial-menu-backdrop" type="button" aria-label="Close navigation" onClick={() => setHamburgerClass('hamburger-nav')} />}

            <header className="App-header site-masthead">
                <div className="site-masthead-inner">
                    <button type="button" className="hamburger-icon site-menu-toggle" data-landing-menu-toggle
                        aria-expanded={isMenuOpen} onClick={hamburgerClick} title="Open navigation menu" aria-label="Open navigation menu">
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <a href="/" data-public-link className="site-wordmark" aria-label="WordMage home">
                        <img src="/images/wordmage-logo.png" alt="" width="28" height="32" />
                        <span>WordMage</span>
                    </a>
                <div className="header-right">
                    {isEditorialLanding ? (
                        <a href="/browse" data-public-link className="site-browse-link">Browse <span aria-hidden="true">↗</span></a>
                    ) : !authUser ? (
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
                                {hasUnreadInboxWords && <span className="account-inbox-dot" role="status" aria-label="Inbox has unread words" />}
                            </button>
                            {accountMenuOpen && (
                                <div className="account-menu" role="menu">
                                    {hasInboxWords && (
                                        <button className="account-menu-item" onClick={() => {
                                            setAccountMenuOpen(false);
                                            props.history.push('/inbox');
                                        }}>Inbox</button>
                                    )}
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
                </div>
            </header>

            {!isEditorialLanding && <nav className="site-bottom-nav" aria-label="Quick navigation">
                <a href="/random" data-public-link aria-current={['/', '/random'].includes(props.location.pathname) ? 'page' : undefined}>Random</a>
                <a href="/browse" data-public-link aria-current={props.location.pathname.startsWith('/browse') ? 'page' : undefined}>Browse</a>
                {hasUserWorkspace && <>
                    <a href={WordsInterface.getAlbumIds().Favorites ? `/albums/${WordsInterface.getAlbumIds().Favorites}` : '/albums'} data-public-link
                        aria-current={WordsInterface.getAlbumIds().Favorites && props.location.pathname === `/albums/${WordsInterface.getAlbumIds().Favorites}` ? 'page' : undefined}>Favorites</a>
                    <a href="/albums" data-public-link aria-current={props.location.pathname.startsWith('/albums') && props.location.pathname !== `/albums/${WordsInterface.getAlbumIds().Favorites}` ? 'page' : undefined}>Albums</a>
                </>}
                <button type="button" onClick={handleMastheadShare} title={mastheadShareConfig?.title || 'Share WordMage'}
                    aria-label={mastheadShareConfig?.ariaLabel || mastheadShareConfig?.title || 'Share WordMage'}
                    disabled={mastheadShareConfig?.disabled || false} data-contextual-help={mastheadShareConfig?.contextualHelpId}>Share</button>
            </nav>}

            <ContextualHelp hints={CONTEXTUAL_HELP_HINTS} />
            <PageMetadata />

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
                    <div className="app-page-content"><Switch>
                        <Route exact path={['/rare-words', '/gothic-vocabulary']} render={({ location }) => (
                            <LandingPage appHeader key={location.pathname} page={location.pathname.replace(/\/+$/, '')} onMenuToggle={hamburgerClick} menuOpen={isMenuOpen} />
                        )} />
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
                        <Route exact path="/browse/:start?" render={props => (<BrowseWords
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path="/collective/:start?" component={CollectiveWords} />
                        <Route exact path="/shared/albums/:token" render={props => (<SharedAlbum />)} />
                        <Route exact path="/albums" render={props => (<Albums
                            key={`albums-${activeUserId || 'none'}`}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path="/albums/:id" render={props => (<WordAlbum
                            key={`album-${activeUserId || 'none'}-${props.match.params.id}`}
                            onAIExplain={handleAIExplain}
                            setMastheadShareConfig={setMastheadShareConfig}
                        />)} />
                        <Route exact path="/history" render={props => (<History />)} />
                        <Route exact path="/new-words" render={() => <NewWords onAIExplain={handleAIExplain} />} />
                        <Route exact path="/inbox" render={() => isAdmin ? (
                            <Inbox words={inboxWords} isLoading={inboxLoading} error={inboxError} onAIExplain={handleAIExplain} onMarkedRead={handleInboxMarkedRead} onWordsRefreshed={setInboxWords} />
                        ) : null} />
                        <Route exact path={['/', '/random']} render={props => (<Random
                            key={`random-${activeUserId || 'none'}`}
                            onAIExplain={handleAIExplain}
                            setMastheadShareConfig={setMastheadShareConfig}
                        />)} />
                        <Route exact path="/connect-assistant" component={AssistantLink} />
                        <Route exact path="/settings" component={Profile} />
                        <Route exact path="/login" component={Login} />
                        <Route exact path="/register" component={Register} />
                        <Route exact path="/about" component={About} />
                        <Route render={() => <PublicContent page="/404" />} />
                    </Switch></div>
                </KeyCapture>
            </WordMageContext.Provider>

        </div >
    );
}

export default withRouter(App);
