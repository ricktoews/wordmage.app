import { useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';

function WordForm(props) {
	var word = '', def = '', notes = '', spotlight = true;

	if (props.word) {
		// get word from custom list, from active list.
		var { word, def } = WordsInterface.getWordObj(props.word);
		// If word already exists, set spotlight flag to false;
		var notes = '';
		if (WordsInterface.isSpotlightEntry(props.word)) {
			var { notes } = WordsInterface.getSpotlightEntry(props.word);
		} 
	}
console.log('WordForm props', props);
	const [ newWord, setNewWord ] = useState(word);
	const [ newDef, setNewDef ] = useState(def);
	const [ newNotes, setNewNotes ] = useState(notes);

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
		WordsInterface.saveCustomWord(newWord, newDef, spotlight);
		// If on Spotlight page, add word to active.
		if (props.location.pathname === '/spotlight') {
			WordsInterface.toggleActive(newWord);
		}
		// Save notes.
		WordsInterface.saveNotes(newWord, newNotes);

		// Finally, hide form. This should reach the top and hopefully cascade rerender components.
		props.cancelWordForm();
	}

	return (
	<div className="word-form-container">
	  <div className="word-form-wrapper">
	    <div className="word-form">
	      <h2 className="word">
	        { newWord ? 'Edit' : 'Word Not Listed? Add it!' }
	      </h2>
	      <div className="word">
	        <input placeholder="Word" onChange={handleWord} type="text" id="new-word" size="20" value={newWord} />
	      </div>
	      <div className={'of-interest'}>
	        <textarea placeholder="Definition" onChange={handleDef} id="new-def" value={newDef}></textarea>
	      </div>
	      <div className={'notes hide-section'}>
	        <textarea placeholder="Notes" onChange={handleNotes} id="new-notes">{newNotes}</textarea>
	      </div>
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

