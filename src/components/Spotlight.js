import { useState, useEffect } from 'react';
import OpenCloseIcon from './OpenCloseIcon';
import WordsInterface from '../utils/words-interface';
import Scramble from './Scramble';

function Spotlight(props) {
	const [open, setOpen] = useState(WordsInterface.hasNotes(props.item.word) === false);
	const [openMnemonic, setOpenMnemonic] = useState(WordsInterface.hasNotes(props.item.word) === false);
	const [item, setItem] = useState(props.item);
	const [notes, setNotes] = useState(WordsInterface.getNotes(props.item.word));

	useEffect(() => {
		setItem(props.item);
		setNotes(WordsInterface.getNotes(props.item.word));
	});

	const handleOpenCloseMnemonic = e => {
		setOpenMnemonic(!openMnemonic);		
	};

	const handleOpenClose = e => {
		setOpen(!open);		
	};

	const archiveWord = e => {
		props.moveToArchive(item.word);
	}

	const handleEditMnemonic = e => {
		props.popupMnemonicForm(item.word);
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
              <Scramble word={item.word} />
	      <div className="user-notes-heading">
	      How did you want to remember this word?
	      </div>
	      <div className="user-notes" contentEditable={true} suppressContentEditableWarning={true}>
	      </div>

	      {/* Mnemonic device */}
	      <div className="word">
	        { openMnemonic ? (
	        <button onClick={handleOpenCloseMnemonic} className={'btn btn-info btn-md'}>
                  Hide Mnemonic <span className="glyphicon glyphicon-chevron-up"></span>
                </button>
	          ) : (
	        <button onClick={handleOpenCloseMnemonic} className={'btn btn-info btn-md'}>
                  Show Mnemonic <span className="glyphicon glyphicon-chevron-down"></span>
                </button>
	          )
	        }
	        <button onClick={handleEditMnemonic} className={'btn btn-info btn-md'}>
                  <span className="glyphicon glyphicon-edit"></span>
                </button>
	      </div>
	      <div className={'of-interest' + (openMnemonic ? ' open' : ' closed')}>
	        {notes}
	      </div>

	      {/* Definition */}
	      <div className="word">
	        { open ? (
	        <button onClick={handleOpenClose} className={'btn btn-info btn-md'}>
                  Hide Definition <span className="glyphicon glyphicon-chevron-up"></span>
                </button>
	          ) : (
	        <button onClick={handleOpenClose} className={'btn btn-info btn-md'}>
                  Show Definition <span className="glyphicon glyphicon-chevron-down"></span>
                </button>
	          )
	        }
	      </div>
	      <div className={'of-interest' + (open ? ' open' : ' closed')}>
	        {item.def}
	      </div>
{/*
	      <div className="user-notes-heading">
	      Notes
	      </div>
	      <div className="user-notes" onBlur={handleChange} contentEditable={true} suppressContentEditableWarning={true}>
	        {notes}
	      </div>
	      <div className="button-wrapper" style={{zIndex: 300}}>
	        <button class="btn btn-archive" onClick={archiveWord}>Archive</button>
	      </div>
*/}
	    </div>
	  </div>
	</div>
	);
}

export default Spotlight;
