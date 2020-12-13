import { useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';

function ConfirmDelete(props) {
	const cancelDelete = () => {
		console.log('cancel');
		props.cancelDelete();
		// Just hide form; no need to update any components.
	}

	const deleteWord = () => {
		console.log('delete', props.word);
		// Need to save custom word, spotlight, or whatever.
		WordsInterface.deleteCustomWord(props.word);

		// Finally, hide form. This should reach the top and hopefully cascade rerender components.
		props.cancelDelete();
	}

	return (
	<div className="word-form-container">
	  <div className="word-form-wrapper">
	    <div className="word-form">
	      <h2 className="word">
	        Delete word {props.word}. Are you sure?
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


