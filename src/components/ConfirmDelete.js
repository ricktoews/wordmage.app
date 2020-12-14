import { useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';

function ConfirmDelete(props) {
	const wordObj = WordsInterface.getWordObjById(props.wordId);
console.log('ConfirmDelete wordObj', wordObj);
	const cancelDelete = () => {
		console.log('cancel');
		props.cancelDelete();
		// Just hide form; no need to update any components.
	}

	const deleteWord = () => {
		console.log('delete', props.wordId);
		// Need to save custom word, spotlight, or whatever.
		WordsInterface.deleteCustomWord(props.wordId);

		// Finally, hide form. This should reach the top and hopefully cascade rerender components.
		props.cancelDelete();
	}

	return (
	<div className="word-form-container">
	  <div className="word-form-wrapper">
	    <div className="word-form">
	      <h2 className="word">
	        Delete word {wordObj.word}. Are you sure?
	      </h2>
	      <div className="button-wrapper">
	        <button className="btn btn-cancel" onClick={cancelDelete}>Cancel</button>
	        <button className="btn btn-save" onClick={deleteWord}>Delete</button>
	      </div>
	    </div>
	  </div>
	</div>
	);
}

export default withRouter(ConfirmDelete);

