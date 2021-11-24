import React from 'react';
import ReactDOM from 'react-dom';
import WordsInterface from '../utils/words-interface';

const handleWord = () => {};
const handleDef = () => {};
const customDef = () => {};
const restoreOriginalDef = () => {};
const handleNotes = () => {};
const newNotes = () => {};

const EditModal = ({ show, hide, saveWord, word, def, originalDef, myown, isCustom }) => show ? ReactDOM.createPortal(
	<React.Fragment>
	<div className="modal-container">
	  <div className="modal-wrapper">
	    <div className="word-form">

	      {/* Word input field (custom), or word displayed only (built-in) */}
	      <div className="word">
	        { myown ? <input placeholder="Word" onChange={handleWord} type="text" id="new-word" size="20" value={word} />
	                   : <span>{word}</span> }
	      </div>

	      {/* Word Form Heading: Built-in, or Custom word */}
	      <div className="header">
	        { myown ? 'This is one of yours' : 'Built-in. You can customize the definition, or reset it to the original content.' }
	      </div>

	      {/* Definition input field */}
	      <div className={'of-interest'}>
	        <textarea placeholder="Definition" onChange={handleDef} id="new-def" value={def}></textarea>
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
	        <button className="btn btn-cancel" onClick={hide}>Cancel</button>
	        <button className="btn btn-save" onClick={saveWord}>Save</button>
	      </div>

	    </div>
	  </div>
	</div>
	</React.Fragment>, document.body) : null;

export default EditModal;

