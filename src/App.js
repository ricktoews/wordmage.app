import { useEffect, useState } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Hamburger from './components/Hamburger';
import AddIcon from './components/AddIcon';
import WordForm from './components/WordForm';
import MnemonicForm from './components/MnemonicForm';
import ConfirmDelete from './components/ConfirmDelete';
import ConfirmShare from './components/ConfirmShare';
import ReceiveData from './components/ReceiveData';
import Popup from './components/Popup';
import WordsInterface from './utils/words-interface';

import Spotlight from './components/Spotlight';
import BrowseWords from './components/BrowseWords';
import SpotlightList from './components/SpotlightList';
import Random from './components/Random';
import About from './About';

import './App.scss';

const wordHash = WordsInterface.fullWordList();

function App(props) {
	const [spotlightList, setSpotlightList] = useState(WordsInterface.getSpotlightList());
	const [fullWordList, setFullWordList] = useState(wordHash);
	const [ view, setView ] = useState('rehearse');
	const [ popupState, setPopupState ] = useState(false);
	const [ popupData, setPopupData ] = useState({});
	const [ popupView, setPopupView ] = useState('');
	const [ word, setWord ] = useState('');
	const [ wordId, setWordId ] = useState(0);
	const [ hamburgerClass, setHamburgerClass ] = useState('hamburger-nav');

	const [ addWordState, setAddWordState ] = useState(false);
	const [ wordFormState, setWordFormState ] = useState(false);
	const [ mnemonicFormState, setMnemonicFormState ] = useState(false);
	const [ confirmState, setConfirmState ] = useState(false);
	const [ confirmShareState, setConfirmShareState ] = useState(false);
	const [ confirmReceive, setConfirmReceive ] = useState(false);

	const navToRandom = () => {
		var history = props.history;
console.log('navToRandom', props, history);
		history.push('/random');
		setHamburgerClass('hamburger-nav');
	}

	const navToBrowseWords = () => {
		var history = props.history;
console.log('navToBrowseWords', props, history);
		history.push('/browse');
		setHamburgerClass('hamburger-nav');
	}

	const navToSpotlight = () => {
		var history = props.history;
console.log('navToSpotlight', props, history);
		history.push('/spotlight');
		setHamburgerClass('hamburger-nav');
	}

	const navToSpotlightList = () => {
		var history = props.history;
console.log('navToSpotlightList', props, history);
		history.push('/spotlight-list');
		setHamburgerClass('hamburger-nav');
	}

	const navToAbout = () => {
		var history = props.history;
		history.push('/about');
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
console.log('popupWordForm', wordId);
/*
		setPopupView('add-word');
		setPopupState(true);
		setPopupData({ word });
*/
		setWordId(wordId);
		setWordFormState(true);
	}

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
	  <nav className={hamburgerClass}>
	    <ul>
	      <li onClick={navToRandom}>Random</li>
	      <li onClick={navToSpotlightList}><i className="glyphicon glyphicon-thumbs-up"></i> Liked</li>
	      <li onClick={navToBrowseWords}>Browse</li>
	      <li onClick={navToSpotlight}>Spotlight</li>
	      <li onClick={handleShare}>Share</li>
	      <li onClick={handleReceive}>Receive</li>
	      <li onClick={navToAbout}>About</li>
	    </ul>
	  </nav>

	  <header className="App-header">
	    <div className="header-content">
	      <Hamburger onClick={hamburgerClick} />
	      <div className="header-title">WordMage</div>
	      <AddIcon className="btn btn-danger" onClick={() => { popupWordForm(); }} />
	    </div>
	  </header>

	  { wordFormState ? <WordForm wordId={wordId} cancelWordForm={cancelWordForm} saveWordForm={saveWordForm} /> : <div/> }
	  { mnemonicFormState ? <MnemonicForm word={word} cancel={cancelMnemonicForm} /> : <div/> }
	  { confirmState ? <ConfirmDelete wordId={wordId} cancelDelete={cancelDelete} confirmeDelete={confirmeDelete} /> : <div/> }
	  { confirmShareState ? <ConfirmShare word={word} cancelShare={cancelShare} /> : <div/> }
	  { confirmReceive ? <ReceiveData cancelReceive={cancelReceive} /> : <div/> }
	  <Switch>
	    <Route exact path={['/spotlight/:word/:def']} render={props => <Spotlight
	        popupMnemonicForm={word => { popupMnemonicForm(word) } }
	        popupWordForm={wordId => { popupWordForm(wordId); }}
	        /> } />
	    <Route exact path={['/spotlight']} render={props => <Spotlight
	        popupMnemonicForm={word => { popupMnemonicForm(word) } }
	        popupWordForm={wordId => { popupWordForm(wordId); }}
	        /> } />
	    <Route path="/spotlight-list" render={props => ( <SpotlightList
	        toggleSpotlight={toggleSpotlight}
	        popupWordForm={wordId => { popupWordForm(wordId); }}
	        popupConfirm={wordId => { popupConfirm(wordId); }}
	        />) } />
	    <Route path="/browse/:start?" render={props => ( <BrowseWords
	        toggleSpotlight={toggleSpotlight}
	        popupConfirm={wordId => { popupConfirm(wordId); }}
	        popupWordForm={wordId => { popupWordForm(wordId); }}
	        />) } />
	    <Route path={['/', '/random']} render={props => ( <Random
	        toggleSpotlight={toggleSpotlight}
	        />) } />
	    <Route path="/about" component={About} />
	  </Switch>
	</div>
	);
}	

export default withRouter(App);
