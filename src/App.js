import { useEffect, useState } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Hamburger from './components/Hamburger';
import WordForm from './components/WordForm';
import ConfirmDelete from './components/ConfirmDelete';

import Main from './Main';

import './App.scss';

function App(props) {
	const [ view, setView ] = useState('rehearse');
//	const [ addWordState, setAddWordState ] = useState(false);
	const [ wordFormState, setWordFormState ] = useState(false);
	const [ confirmState, setConfirmState ] = useState(false);
	const [ word, setWord ] = useState('');
	const [ hamburgerClass, setHamburgerClass ] = useState('hamburger-nav');

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
		setHamburgerClass('hamburger-nav');
	}

	const handleReceive = () => {
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
		setWord(word);
		setWordFormState(true);
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

	return (
	<div className="App">
	  <nav class={hamburgerClass}>
	    <ul>
	      <li onClick={navToWordList}>Word List</li>
	      <li onClick={navToSpotlight}>Spotlight</li>
	      <li onClick={navToArchive}>Archive</li>
	      <li onClick={handleShare}>Share</li>
	      <li onClick={handleReceive}>Receive</li>
	    </ul>
	  </nav>

	  <header className="App-header">
	    <div className="header-content">
	      <Hamburger onClick={hamburgerClick} />
	      <div className="header-title">Catalogue of Cool Words</div>
	      {1||view === 'word-list-container' ? <button className="btn btn-add" onClick={popupWordForm}>+</button> : <div /> }
	    </div>
	  </header>
	  <Main view={view} 
	    popupConfirm={word => { popupConfirm(word) }}
	    popupWordForm={word => { popupWordForm(word) }} />
	  { wordFormState ? <WordForm word={word} cancelWordForm={cancelWordForm} saveWordForm={saveWordForm} /> : <div/> }
	  { confirmState ? <ConfirmDelete word={word} cancelDelete={cancelDelete} confirmeDelete={confirmeDelete} /> : <div/> }
	</div>
	);
}	

export default withRouter(App);
