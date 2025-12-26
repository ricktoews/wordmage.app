import { Fab, Webchat } from '@botpress/webchat'

import { useEffect, useState, useRef, useContext, useMemo } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';

import KeyCapture from './KeyCapture';
// Import WordMageContext to set Context for app.
import { WordMageContext } from './WordMageContext';
import Login from './Login';

// Import WordsInterface - data, utilities.
import WordsInterface from './utils/words-interface';

// Import components
import Hamburger from './components/Hamburger';
import WMLogo from './components/icons/WMLogo';
import AddIcon from './components/icons/AddIcon';
import PopupWordForm from './components/PopupWordForm';
import PopupAIExplain from './components/PopupAIExplain';
import Popup from './components/Popup';
import Spotlight from './components/Spotlight';
import BrowseWords from './components/BrowseWords';
import CollectiveWords from './components/CollectiveWords';
import Learn from './components/Learn';
import Train from './components/Train';
import SpotlightList from './components/SpotlightList';
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
        if (elClass.indexOf('word-form-container') !== -1 || elClass.indexOf('word-form-wrapper') !== -1) {
            //setWordFormState(false);
        }
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

    const navToSpotlight = () => {
        var history = props.history;
        history.push('/spotlight');
        setView('Solve');
        setHamburgerClass('hamburger-nav');
    }

    const navToSpotlightList = () => {
        var history = props.history;
        history.push('/spotlight-list');
        setView('Favorites');
        setHamburgerClass('hamburger-nav');
    }

    const navToLearn = () => {
        var history = props.history;
        history.push('/learn');
        setView('Learn');
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

    const toggleSpotlight = word => {
        var newSpotlightList = WordsInterface.toggleSpotlight(word);
    }

    const handleAIExplain = (word, definition) => {
        setAiExplainWord({ word, definition });
        console.log(`AI Explain requested for: ${word}`);
    }

    return (
        <div className="App">

            <nav ref={hamburgerRef} className={hamburgerClass}>
                <ul>
                    <li onClick={navToRandom}><i className="glyphicon glyphicon-random"></i> Random</li>
                    {authUser && <li onClick={navToSpotlightList}><i className="glyphicon glyphicon-thumbs-up"></i> Favorites</li>}
                    <li onClick={navToBrowseWords}><i className="glyphicon glyphicon-sunglasses"></i> Browse</li>
                    {authUser && <li onClick={navToLearn}><i className="glyphicon glyphicon-leaf"></i> Learn</li>}
                    {authUser && <li onClick={navToTrain}><i className="glyphicon glyphicon-education"></i> Train</li>}
                    {authUser && <li onClick={navToSpotlight}><i className="glyphicon glyphicon-retweet"></i> Unscramble</li>}
                    <li onClick={navToCollective}><i className="glyphicon glyphicon-book"></i> Collective</li>
                    <li onClick={navToAbout}><i className="glyphicon glyphicon-home"></i> About</li>
                </ul>
            </nav>

            <header className="App-header">
                <div className="hamburger-icon-container">
                    <WMLogo onClick={hamburgerClick} />
                </div>                <div className="header-content">
                </div>

                <div className="header-nav-buttons">
                    <button className="header-nav-btn" onClick={navToRandom} title="Random">
                        <i className="glyphicon glyphicon-random"></i>
                    </button>
                    {authUser && (
                        <button className="header-nav-btn" onClick={navToSpotlightList} title="Favorites">
                            <i className="glyphicon glyphicon-thumbs-up"></i>
                        </button>
                    )}
                    <button className="header-nav-btn" onClick={navToBrowseWords} title="Browse">
                        <i className="glyphicon glyphicon-sunglasses"></i>
                    </button>
                </div>

                <div className="header-right">
                    {!authUser ? (
                        <button className="header-login-btn" onClick={navToLogin} title="Log In">
                            <i className="glyphicon glyphicon-user"></i>
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

            {/*false && wordFormState ? <WordForm wordId={wordId} cancelWordForm={cancelWordForm} saveWordForm={saveWordForm} /> : <div />*/}

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
                        <Route exact path={['/spotlight/:word/:def']} render={props => <Spotlight
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
                        <Route exact path='/spotlight/:word' render={props => <Spotlight
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                        />} />
                        <Route exact path='/spotlight' render={props => <Spotlight
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                        />} />
                        <Route path="/spotlight-list" render={props => (<SpotlightList
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            toggleSpotlight={toggleSpotlight}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route path="/learn" render={props => (<Learn
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            toggleSpotlight={toggleSpotlight}
                        />)} />
                        <Route path="/browse/:start?" render={props => (<BrowseWords
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            toggleSpotlight={toggleSpotlight}
                            botpressButton={botpressClientId}
                            toggleWebchat={toggleWebchat}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route path="/collective/:start?" render={props => (<CollectiveWords
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            toggleSpotlight={toggleSpotlight}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route exact path={['/', '/random']} render={props => (<Random
                            popupWordForm={wordId => { popupWordForm(wordId); }}
                            toggleSpotlight={toggleSpotlight}
                            onAIExplain={handleAIExplain}
                        />)} />
                        <Route path="/profile" component={Profile} />
                        <Route path="/login" component={Login} />
                        <Route path="/register" component={Register} />
                        <Route path="/about" component={About} />
                    </Switch>
                </KeyCapture>
            </WordMageContext.Provider>

        </div>
    );
}

export default withRouter(App);
