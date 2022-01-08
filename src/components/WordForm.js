import { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';

function WordForm(props) {
	var word = '', def = '', mem = '', source = '', spotlight = true;

	if (props.wordId) {
		// get word from custom list, from active list.
		var { word, def, mem = '', source = '', original } = WordsInterface.getWordObjById(props.wordId);
		// If word already exists, set spotlight flag to false;
		if (WordsInterface.isSpotlightEntry(props.word)) {
			var { source = '' } = WordsInterface.getSpotlightEntry(props.word);
		} 
	}

	const [ newWord, setNewWord ] = useState(word);
	const [ newDef, setNewDef ] = useState(def);
	const [ newMem, setNewMem ] = useState(mem);
	const [ newSource, setNewSource ] = useState(source);

	const handleChange = e => {
		var el = e.target;
		var notes = el.textContent;
	};

	const handleWord = e => {
		var el = e.target;
		setNewWord(el.value);
	};

	const handleDef = e => {
		var el = e.target;
		setNewDef(el.value);
	};

	const handleMem = e => {
		var el = e.target;
		setNewMem(el.value);
	};

	const handleSource = e => {
		var el = e.target;
		setNewSource(el.value);
	};

	const cancelWord = () => {
		console.log('cancel');
		props.cancelWordForm();
		// Just hide form; no need to update any components.
	}

	const saveWord = () => {
		// Need to save custom word, spotlight, or whatever.
		WordsInterface.saveCustomWord(props.wordId, newWord, newDef, newMem, newSource, spotlight);
		// If on Spotlight page, add word to active.
		if (props.location.pathname === '/spotlight') {
			WordsInterface.toggleActive(newWord);
		}

		// Finally, hide form. This should reach the top and hopefully cascade rerender components.
		props.cancelWordForm();
	}

	return (
	<div className="word-form-container">
	  <div className="word-form-wrapper">
	    <div className="word-form">

	      {/* Word Form Heading: Built-in, or Custom word */}
		  <div className="form field-wrapper">
		      {/* Word input field (custom), or word displayed only (built-in) */}
		      <div className="input-field">
		        <input placeholder="Word" onChange={handleWord} type="text" id="new-word" size="20" value={newWord} />
		      </div>

		      {/* Definition input field */}
		      <div className="input-field">
		        <textarea placeholder="Definition" onChange={handleDef} id="new-def" value={newDef}></textarea>
		      </div>

		      {/* Part to memorize */}
		      <div className="input-field">
		        <textarea placeholder="Memorize (opt)" onChange={handleMem} id="new-mem" value={newMem}></textarea>
		      </div>

		      {/* Source. For ... ? */}
		      <div className="input-field">
		        <input placeholder="Source" onChange={handleSource} type="text" id="new-notes" size="20" value={newSource} />
		      </div>

		      {/* Cancel / Save buttons */}
		      <div className="button-wrapper">
		        <button className="cancel" onClick={cancelWord}>Cancel</button>
		        <button className="save" onClick={saveWord}>Save</button>
	          </div>
	      </div>

	    </div>
	  </div>
	</div>
	);
}

export default withRouter(WordForm);

