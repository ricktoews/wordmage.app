import { useState, useEffect } from 'react';
import OpenCloseIcon from './OpenCloseIcon';
import WordsInterface from '../utils/words-interface';

function Spotlight(props) {
	const [open, setOpen] = useState(WordsInterface.hasNotes(props.item.word) === false);
	const [item, setItem] = useState(props.item);
	const [notes, setNotes] = useState(WordsInterface.getNotes(props.item.word));

	useEffect(() => {
		setOpen(WordsInterface.hasNotes(props.item.word) === false);
		setItem(props.item);
		setNotes(WordsInterface.getNotes(props.item.word));
	}, [props.item]);

	const handleOpenClose = e => {
		setOpen(!open);		
	};

	const archiveWord = e => {
		WordsInterface.archiveWord(item.word);
		props.moveToArchive();
	}

	const handleChange = e => {
		var el = e.target;
		var notes = el.textContent;
		WordsInterface.saveNotes(item.word, notes);
		if (notes) {
			setOpen(false);
		}
	};

	return (
	<div className="spotlight-container">
	  <div className="spotlight-wrapper">
	    <div className="spotlight">
	      <div className="word">
	        {item.word}
	        <OpenCloseIcon onClick={handleOpenClose} className={open ? 'icon-open' : 'icon-closed' } height="15px" width="20px" fill="red" />
	      </div>
	      <div className={'of-interest' + (open ? ' open' : ' closed')}>
	        {item.def}
	      </div>
	      <div className="user-notes-heading">
	      Notes
	      </div>
	      <div className="user-notes" onBlur={handleChange} contentEditable={true} suppressContentEditableWarning={true}>
	        {notes}
	      </div>
	      <div className="button-wrapper" style={{zIndex: 300}}>
	        <button class="btn btn-archive" onClick={archiveWord}>Archive</button>
	      </div>
	    </div>
	  </div>
	</div>
	);
}

export default Spotlight;
