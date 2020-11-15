import { useEffect, useState } from 'react';

import Main from './Main';

import './App.scss';

const ToggleLabels = ['Word List', 'Spotlight'];

function App() {
	const [ view, setView ] = useState('rehearse');
	const [ addWordState, setAddWordState ] = useState(false);
	const [ toggleLabel, setToggleLabel ] = useState(ToggleLabels[0]);

	const handleViewToggle = () => {
		var newView, newToggleLabel;
		if (view === 'rehearse') {
			newView = 'word-list-container';
			newToggleLabel = ToggleLabels[1];
			
		} else {
			newView = 'rehearse';
			newToggleLabel = ToggleLabels[0];
		}

		setView(newView);
		setToggleLabel(newToggleLabel);
	};

	const handleAddWordState = () => {
		setAddWordState(true);
	}

	const cancelAddWord = () => {
		setAddWordState(false);
	}

	return (
	<div className="App">
	  <header className="App-header">
	    Catalogue of Cool Words
	    <button className="btn btn-toggle" onClick={handleViewToggle}>{toggleLabel}</button>
	    {view === 'word-list-container' ? <button className="btn btn-add" onClick={handleAddWordState}>+</button> : <div /> }
	  </header>
	  <Main view={view} addWordState={addWordState} cancelAddWord={cancelAddWord} />
	</div>
	);
}	

export default App;
