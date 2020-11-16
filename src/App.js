import { useEffect, useState } from 'react';
import Hamburger from './components/Hamburger';

import Main from './Main';

import './App.scss';

const ToggleLabels = ['Word List', 'Spotlight'];

function App() {
	const [ view, setView ] = useState('word-list-container');
	const [ addWordState, setAddWordState ] = useState(false);
	const [ toggleLabel, setToggleLabel ] = useState(ToggleLabels[1]);
	const [ hamburgerClass, setHamburgerClass ] = useState('hamburger-nav');

	const navToWordList = () => {
		setView('word-list-container');
		setToggleLabel(ToggleLabels[1]);
		setHamburgerClass('hamburger-nav');
	}

	const navToSpotlight = () => {
		setView('rehearse');
		setToggleLabel(ToggleLabels[0]);
		setHamburgerClass('hamburger-nav');
	}

	const navToArchive = () => {
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

	const handleAddWordState = () => {
		setAddWordState(true);
	}

	const cancelAddWord = () => {
		setAddWordState(false);
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
	      {view === 'word-list-container' ? <button className="btn btn-add" onClick={handleAddWordState}>+</button> : <div /> }
	    </div>
	  </header>
	  <Main view={view} addWordState={addWordState} cancelAddWord={cancelAddWord} />
	</div>
	);
}	

export default App;
