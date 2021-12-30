import { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';

function WordForm(props) {
	var word = '', def = '', source = '', spotlight = true, originalDef = '';

	if (props.wordId) {
		// get word from custom list, from active list.
		var { word, def, source = '', original, customDef } = WordsInterface.getWordObjById(props.wordId);
		// If word already exists, set spotlight flag to false;
		if (WordsInterface.isSpotlightEntry(props.word)) {
			var { source = '' } = WordsInterface.getSpotlightEntry(props.word);
		} 
		if (original) originalDef = original;
	}

	const [ newWord, setNewWord ] = useState(word);
	const [ newDef, setNewDef ] = useState(def);
	const [ newSource, setNewSource ] = useState(source);
/*
	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.addEventListener('WordForm click', handleDocumentClicked, true);
		}
	}, []);

	const handleDocumentClicked = e => {
		var el = e.target;
		console.log('handleDocumentClicked', el);
	}
*/
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
		WordsInterface.saveCustomWord(props.wordId, newWord, newDef, newSource, spotlight);
		// If on Spotlight page, add word to active.
		if (props.location.pathname === '/spotlight') {
			WordsInterface.toggleActive(newWord);
		}
		// Save notes.
		//WordsInterface.saveNotes(newWord, newNotes);

		// Finally, hide form. This should reach the top and hopefully cascade rerender components.
		props.cancelWordForm();
	}

	const restoreOriginalDef = () => {
		console.log('Restore', originalDef, 'for this word');
		setNewDef(originalDef);
	};

	return (
	<div className="word-form-container">
	  <div className="word-form-wrapper">
	    <div className="word-form">

	      {/* Word Form Heading: Built-in, or Custom word */}
	      <div className="header">
	        Add Word
	      </div>

		  <div className="form field-wrapper">
		      {/* Word input field (custom), or word displayed only (built-in) */}
		      <div className="input-field">
		        <input placeholder="Word" onChange={handleWord} type="text" id="new-word" size="20" value={newWord} />
		      </div>

		      {/* Definition input field */}
		      <div className="input-field">
		        <textarea placeholder="Definition" onChange={handleDef} id="new-def" value={newDef}></textarea>
		      </div>

		      {/* If definition customized, provide a Reset option. */}
		      { customDef ? (
		      <div className={'of-interest'}>
		        <div className="" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
		          <div>Original Definition</div>
		          <div className="btn btn-warning btn-sm" onClick={restoreOriginalDef}>Restore</div>
		        </div>
		        <div className="original-def">{ originalDef }</div>
		      </div>) : null }

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

