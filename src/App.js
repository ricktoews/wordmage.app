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
import Main from './Main';

import './App.scss';

function App(props) {
	const [ view, setView ] = useState('rehearse');
	const [ popupState, setPopupState ] = useState(false);
	const [ popupData, setPopupData ] = useState({});
	const [ popupView, setPopupView ] = useState('');
	const [ word, setWord ] = useState('');
	const [ hamburgerClass, setHamburgerClass ] = useState('hamburger-nav');

//	const [ addWordState, setAddWordState ] = useState(false);
	const [ wordFormState, setWordFormState ] = useState(false);
	const [ mnemonicFormState, setMnemonicFormState ] = useState(false);
	const [ confirmState, setConfirmState ] = useState(false);
	const [ confirmShareState, setConfirmShareState ] = useState(false);
	const [ confirmReceive, setConfirmReceive ] = useState(false);

	const navToWordList = () => {
		var history = props.history;
console.log('navToWordList', props, history);
		history.push('/word-list');
		setHamburgerClass('hamburger-nav');
	}

	const navToSpotlight = () => {
		var history = props.history;
console.log('navToWordList', props, history);
		history.push('/spotlight');
		setHamburgerClass('hamburger-nav');
	}

	const navToArchive = () => {
		var history = props.history;
console.log('navToWordList', props, history);
		history.push('/archive');
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

	
	const popupConfirm = word => {
		setWord(word);
		setConfirmState(true);
	}

	const popupWordForm = word => {
console.log('popupWordForm', word);
/*
		setPopupView('add-word');
		setPopupState(true);
		setPopupData({ word });
*/
		setWord(word);
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

	return (
	<div className="App">
	  <nav class={hamburgerClass}>
	    <ul>
	      <li onClick={navToSpotlight}>Spotlight</li>
	      <li onClick={navToWordList}>Word List</li>
	      <li onClick={handleShare}>Share</li>
	      <li onClick={handleReceive}>Receive</li>
{/*
	      <li onClick={navToArchive}>Archive</li>
*/}
	    </ul>
	  </nav>

	  <header className="App-header">
	    <div className="header-content">
	      <Hamburger onClick={hamburgerClick} />
	      <div className="header-title">Words To Remember</div>
	      {1||view === 'word-list-container' ? <AddIcon className="btn btn-danger" onClick={popupWordForm} /> : <div /> }
	    </div>
	  </header>
	  <Main view={view} 
	    popupConfirm={word => { popupConfirm(word) }}
	    popupWordForm={word => { popupWordForm(word) }} 
	    popupMnemonicForm={word => { popupMnemonicForm(word) }} />
	  {/* popupState ? <Popup data={popupData} view={popupView} /> : <div/> */}
	  { wordFormState ? <WordForm word={word} cancelWordForm={cancelWordForm} saveWordForm={saveWordForm} /> : <div/> }
	  { mnemonicFormState ? <MnemonicForm word={word} cancel={cancelMnemonicForm} /> : <div/> }
	  { confirmState ? <ConfirmDelete word={word} cancelDelete={cancelDelete} confirmeDelete={confirmeDelete} /> : <div/> }
	  { confirmShareState ? <ConfirmShare word={word} cancelShare={cancelShare} /> : <div/> }
	  { confirmReceive ? <ReceiveData cancelReceive={cancelReceive} /> : <div/> }
	</div>
	);
}	

export default withRouter(App);
