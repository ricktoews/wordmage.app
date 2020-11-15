import { useEffect, useState } from 'react';

import Main from './Main';

import './App.scss';

function App() {
	const [ view, setView ] = useState('rehearse');

	const handleViewToggle = () => {
		let newView = view === 'rehearse' ? 'word-list-container' : 'rehearse';
		setView(newView);
	};

	return (
	<div className="App">
	  <header className="App-header">
	    Catalogue of Cool Words
	    <button onClick={handleViewToggle}>Toggle View</button>
	  </header>
	  <Main view={view} />
	</div>
	);
}	

export default App;
