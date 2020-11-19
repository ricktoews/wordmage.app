import { useState } from 'react';
import WordsInterface from '../utils/words-interface';

function AddWord(props) {
	const [ newWord, setNewWord ] = useState('');
	const [ newDef, setNewDef ] = useState('');

	const fieldWord = props.editWordItem && props.editWordItem.word || '';
	const fieldDef = props.editWordItem && props.editWordItem.def || '';

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

	const cancelWord = () => {
		console.log('cancel');
		props.cancelAddWord();
	}

	const saveWord = () => {
		console.log('save', newWord, newDef);
		WordsInterface.saveCustomWord(newWord, newDef);
		props.updateWordList();
		props.cancelAddWord();
	}

	return (
	<div className="add-word-container">
	  <div className="add-word-wrapper">
	    <div className="add-word">
	      <h2 className="word">
	        { fieldWord ? 'Edit' : 'Word Not Listed? Add it!' }
	      </h2>
	      <div className="word">
	        <input placeholder="Word" onChange={handleWord} type="text" id="new-word" size="20" value={fieldWord} />
	      </div>
	      <div className={'of-interest'}>
	        <textarea placeholder="Definition" onChange={handleDef} id="new-def" rows="5">{fieldDef}</textarea>
	      </div>
	      <div className="button-wrapper">
	        <button class="btn btn-cancel" onClick={cancelWord}>Cancel</button>
	        <button class="btn btn-save" onClick={saveWord}>Save</button>
	      </div>
	    </div>
	  </div>
	</div>
	);
}

export default AddWord;

