import { useEffect, useState, useRef, useContext, useMemo } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';

// Import WordMageContext to set Context for app.
import { WordMageContext } from './WordMageContext';

// Import WordsInterface - data, utilities.
import WordsInterface from './utils/words-interface';

// Import components
import Hamburger from './components/Hamburger';
import AddIcon from './components/icons/AddIcon';
import WordForm from './components/WordForm';
import Spotlight from './components/Spotlight';
import BrowseWords from './components/BrowseWords';
import Learn from './components/Learn';
import SpotlightList from './components/SpotlightList';
import Random from './components/Random';
import Register from './Register';
import Profile from './Profile';
import About from './About';

import './App.scss';

function App(props) {
  // Set up Context for app. WordMageContext.Provider will wrap everything.
  const [ contextValue, setContextValue ] = useState({ targetEl: null });
  const contextProviderValue = useMemo(() => ({ contextValue, setContextValue }), [contextValue, setContextValue]);

  //---------------------------------------------
	const wordHash = WordsInterface.fullWordList();
	const [fullWordList, setFullWordList] = useState(wordHash);
	const [ view, setView ] = useState('Random');
	const [ word, setWord ] = useState('');
	const [ wordId, setWordId ] = useState(0);
	const [ hamburgerClass, setHamburgerClass ] = useState('hamburger-nav');

	const [ wordFormState, setWordFormState ] = useState(false);

	const hamburgerRef = useRef(null);

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
		if (elClass.indexOf('word-form-container') !== -1 || elClass.indexOf('word-form-wrapper') !== -1) {
			setWordFormState(false);
		}
    setContextValue({...contextValue, targetEl: el });
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
		setView('Liked');
		setHamburgerClass('hamburger-nav');
	}

	const navToLearn = () => {
		var history = props.history;
		history.push('/learn');
		setView('Learn');
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
console.log('cancelWordForm');
		setWordFormState(false);
	}

	const saveWordForm  = () => {
		setWordFormState(false);
	}

	const toggleSpotlight = word => {
		var newSpotlightList = WordsInterface.toggleSpotlight(word);
	}

	return (
	<div className="App">
	  <nav ref={hamburgerRef} className={hamburgerClass}>
	    <ul>
	      <li onClick={navToRandom}><i className="glyphicon glyphicon-random"></i> Random</li>
	      <li onClick={navToSpotlightList}><i className="glyphicon glyphicon-thumbs-up"></i> Liked</li>
	      <li onClick={navToBrowseWords}><i className="glyphicon glyphicon-sunglasses"></i> Browse</li>
	      <li onClick={navToLearn}><i className="glyphicon glyphicon-leaf"></i> Learn</li>
	      <li onClick={navToSpotlight}><i className="glyphicon glyphicon-retweet"></i> Unscramble</li>
	      <li onClick={navToProfile}><i className="glyphicon glyphicon-user"></i> Profile</li>
	      <li onClick={navToAbout}><i className="glyphicon glyphicon-home"></i> About</li>
	    </ul>
	  </nav>

	  <header className="App-header">
	    <div className="header-content">
	      <Hamburger onClick={hamburgerClick} />
	      <div className="header-title">WordMage - {view}</div>
		  <AddIcon className="btn btn-danger" onClick={() => { popupWordForm(); }} />
	    </div>
	  </header>

	  { wordFormState ? <WordForm wordId={wordId} cancelWordForm={cancelWordForm} saveWordForm={saveWordForm} /> : <div/> }

	  <WordMageContext.Provider value={contextProviderValue}>
      <Switch>
        <Route exact path={['/spotlight/:word/:def']} render={props => <Spotlight
            popupWordForm={wordId => { popupWordForm(wordId); }}
            /> } />
        <Route exact path={['/learn']} render={props => ( <Learn
            popupWordForm={wordId => { popupWordForm(wordId); }}
            />) } />
        <Route exact path='/spotlight' render={props => <Spotlight
            popupWordForm={wordId => { popupWordForm(wordId); }}
            /> } />
        <Route path="/spotlight-list" render={props => ( <SpotlightList
            popupWordForm={wordId => { popupWordForm(wordId); }}
            toggleSpotlight={toggleSpotlight}
            />) } />
        <Route path="/browse/:start?" render={props => ( <BrowseWords
            popupWordForm={wordId => { popupWordForm(wordId); }}
            toggleSpotlight={toggleSpotlight}
            />) } />
        <Route exact path={['/', '/random']} render={props => ( <Random
            popupWordForm={wordId => { popupWordForm(wordId); }}
            toggleSpotlight={toggleSpotlight}
            />) } />
        <Route path="/profile" component={Profile} />
        <Route path="/register" component={Register} />
        <Route path="/about" component={About} />
      </Switch>
    </WordMageContext.Provider>
	</div>
	);
}	

export default withRouter(App);
