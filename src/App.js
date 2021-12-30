import { useEffect, useState, useRef } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Hamburger from './components/Hamburger';
import AddIcon from './components/icons/AddIcon';
import WordForm from './components/WordForm';
//import MnemonicForm from './components/MnemonicForm';
import ConfirmDelete from './components/ConfirmDelete';
import ConfirmShare from './components/ConfirmShare';
import ReceiveData from './components/ReceiveData';
//import Popup from './components/Popup';
import WordsInterface from './utils/words-interface';

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
	const wordHash = WordsInterface.fullWordList();
//	const [spotlightList, setSpotlightList] = useState(WordsInterface.getSpotlightList());
	const [fullWordList, setFullWordList] = useState(wordHash);
	const [ view, setView ] = useState('Random');
//	const [ popupState, setPopupState ] = useState(false);
//	const [ popupData, setPopupData ] = useState({});
//	const [ popupView, setPopupView ] = useState('');
	const [ word, setWord ] = useState('');
	const [ wordId, setWordId ] = useState(0);
	const [ hamburgerClass, setHamburgerClass ] = useState('hamburger-nav');

//	const [ addWordState, setAddWordState ] = useState(false);
	const [ wordFormState, setWordFormState ] = useState(false);

	const [ confirmState, setConfirmState ] = useState(false);
	const [ confirmShareState, setConfirmShareState ] = useState(false);
	const [ confirmReceive, setConfirmReceive ] = useState(false);

	const hamburgerRef = useRef(null);

	/*
	const closePopups = () => {
//		setAddWordState(false);
		setConfirmShareState(false);
		setConfirmReceive(false);
	}
	*/

	const handleDocumentClicked = e => {
		// Check if clicked outside hambuger menu.
		var el = e.target;
		console.log('handleDocumentClicked', el);
		var elClass = Array.from(el.classList);
		var parentElClass = Array.isArray(el.parentNode?.classList) ? Array.from(el.parentNode.classList) : [];
		if (elClass.indexOf('hamburger-icon') === -1 && parentElClass.indexOf('hamburger-icon') === -1) {
			if (!hamburgerRef.current.contains(el)) {
				setHamburgerClass('hamburger-nav');
			}
		}
		setConfirmShareState(false);
		if (el.tagName.toLowerCase() !== 'input') {
			setConfirmReceive(false);
		}
		if (elClass.indexOf('word-form-container') !== -1 || elClass.indexOf('word-form-wrapper') !== -1) {
			setWordFormState(false);
		}
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
		setView('Unscramble');
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

	const handleShare = () => {
		setConfirmShareState(true);
		setHamburgerClass('hamburger-nav');
	}

	const handleReceive = () => {
		setConfirmReceive(true);
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

	
	const popupConfirm = wordId => {
		setWordId(wordId);
		setConfirmState(true);
	}

	const popupWordForm = wordId => {
		setWordId(wordId);
		setWordFormState(true);
	}

	/*
	const popupMnemonicForm = word => {
console.log('popupMnemonicForm', word);
		setWord(word);
		setMnemonicFormState(true);
	}

	const cancelMnemonicForm = () => {
console.log('cancelMnemonicForm');
//		setWord('');
		setMnemonicFormState(false);
	}
	*/

	const cancelWordForm = () => {
console.log('cancelWordForm');
		setWordFormState(false);
	}

	const saveWordForm  = () => {
		setWordFormState(false);
	}

	const cancelDelete = () => {
		setConfirmState(false);
	}

	const confirmeDelete = () => {
		setConfirmState(false);
	}

	const cancelShare = () => {
		setConfirmShareState(false);
	}

	const cancelReceive = () => {
		setConfirmReceive(false);
	}

	const toggleLearn = word => {
		var newLearn = WordsInterface.toggleLearn(word);
	}

	const toggleSpotlight = word => {
		var newSpotlightList = WordsInterface.toggleSpotlight(word);
		// FIXME: Why do we need this, since spotlightList isn't used in App.js or passed to a component? 
		//setSpotlightList(newSpotlightList);
	}

	const updateWordList = () => {
		setFullWordList(WordsInterface.fullWordList());
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

		{/*
	      <li onClick={handleShare}><i className="glyphicon glyphicon-upload"></i> Share</li>
	      <li onClick={handleReceive}><i className="glyphicon glyphicon-download"></i> Receive</li>
		  */}

	      <li onClick={navToProfile}>Profile</li>
		{/*	      <li onClick={navToRegister}>Register</li> */}

	      <li onClick={navToAbout}>About</li>
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
	  { confirmState ? <ConfirmDelete wordId={wordId} cancelDelete={cancelDelete} confirmeDelete={confirmeDelete} /> : <div/> }
	  { confirmShareState ? <ConfirmShare word={word} cancelShare={cancelShare} /> : <div/> }
	  { confirmReceive ? <ReceiveData cancelReceive={cancelReceive} /> : <div/> }
	  <Switch>
	    <Route exact path={['/spotlight/:word/:def']} render={props => <Spotlight
	        popupWordForm={wordId => { popupWordForm(wordId); }}
	        /> } />
	    <Route exact path={['/learn']} render={props => ( <Learn
	        popupWordForm={wordId => { popupWordForm(wordId); }}
	        toggleLearn={toggleLearn}
	        />) } />
	    <Route exact path='/spotlight' render={props => <Spotlight
	        popupWordForm={wordId => { popupWordForm(wordId); }}
	        /> } />
	    <Route path="/spotlight-list" render={props => ( <SpotlightList
	        popupWordForm={wordId => { popupWordForm(wordId); }}
	        toggleSpotlight={toggleSpotlight}
	        popupConfirm={wordId => { popupConfirm(wordId); }}
	        />) } />
	    <Route path="/browse/:start?" render={props => ( <BrowseWords
	        popupWordForm={wordId => { popupWordForm(wordId); }}
	        toggleSpotlight={toggleSpotlight}
	        popupConfirm={wordId => { popupConfirm(wordId); }}
	        />) } />
	    <Route exact path={['/', '/random']} render={props => ( <Random
	        popupWordForm={wordId => { popupWordForm(wordId); }}
	        toggleSpotlight={toggleSpotlight}
	        />) } />
	    <Route path="/profile" component={Profile} />
	    <Route path="/register" component={Register} />
	    <Route path="/about" component={About} />
	  </Switch>
	</div>
	);
}	

export default withRouter(App);
