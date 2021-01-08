import { useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';

function WordForm(props) {
	var word = '', def = '', notes = '', spotlight = true, myown = true, originalDef = '';

	if (props.wordId) {
		// get word from custom list, from active list.
		var { word, def, myown, original, customDef } = WordsInterface.getWordObjById(props.wordId);
		// If word already exists, set spotlight flag to false;
		var notes = '';
		if (WordsInterface.isSpotlightEntry(props.word)) {
			var { notes } = WordsInterface.getSpotlightEntry(props.word);
		} 
		if (original) originalDef = original;
	}

	const [ newWord, setNewWord ] = useState(word);
	const [ newDef, setNewDef ] = useState(def);
	const [ newNotes, setNewNotes ] = useState(notes);
	const [ newMyOwn, setNewMyOwn ] = useState(myown);

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

	const handleNotes = e => {
		var el = e.target;
		setNewNotes(el.value);
	};

	const cancelWord = () => {
		console.log('cancel');
		props.cancelWordForm();
		// Just hide form; no need to update any components.
	}

	const saveWord = () => {
		console.log('save', newWord, newDef);
		// Need to save custom word, spotlight, or whatever.
		WordsInterface.saveCustomWord(props.wordId, newWord, newDef, spotlight);
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

	      {/* Word prompt: Add or Edit */}
{/*
	      <div className="word">
	        { newWord ? 'Edit' : 'Word Not Listed? Add it!' }
	      </div>
*/}

	      {/* Word input field (custom), or word displayed only (built-in) */}
	      <div className="word">
	        { newMyOwn ? <input placeholder="Word" onChange={handleWord} type="text" id="new-word" size="20" value={newWord} />
	                   : <span>{newWord}</span> }
	      </div>

	      {/* Word Form Heading: Built-in, or Custom word */}
	      <div className="header">
	        { newMyOwn ? 'This is one of yours' : 'Built-in. You can customize the definition, or reset it to the original content.' }
	      </div>

	      {/* Definition input field */}
	      <div className={'of-interest'}>
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

	      {/* Notes. For ... ? */}
	      <div className={'notes hide-section'}>
	        <textarea placeholder="Notes" onChange={handleNotes} id="new-notes" value={newNotes}></textarea>
	      </div>

	      {/* Cancel / Save buttons */}
	      <div className="button-wrapper">
	        <button className="btn btn-cancel" onClick={cancelWord}>Cancel</button>
	        <button className="btn btn-save" onClick={saveWord}>Save</button>
	      </div>

	    </div>
	  </div>
	</div>
	);
}

export default withRouter(WordForm);

