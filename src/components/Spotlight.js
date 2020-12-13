import { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import OpenCloseIcon from './OpenCloseIcon';
import WordsInterface from '../utils/words-interface';
import Scramble from './Scramble';

function Spotlight(props) {
	const randomItem = WordsInterface.getSpotlightItem();
	const [item, setItem] = useState(randomItem);
	const [openDef, setOpenDef] = useState(WordsInterface.hasNotes(randomItem.word) === false);
	const [openMnemonic, setOpenMnemonic] = useState(WordsInterface.hasNotes(randomItem.word) === false);
	//const [item, setItem] = useState(props.item);
	const [notes, setNotes] = useState(WordsInterface.getNotes(randomItem.word));

	const handleOpenCloseMnemonic = e => {
		setOpenMnemonic(!openMnemonic);		
	};

	const handleOpenClose = e => {
		setOpenDef(!openDef);		
	};

	const handleAnother = e => {
		var anotherItem = WordsInterface.getSpotlightItem();
		setItem(anotherItem);
	};

	const handleEditMnemonic = e => {
		props.popupMnemonicForm(item.word);
	}

	const handleChange = e => {
		var el = e.target;
		var notes = el.textContent;
		WordsInterface.saveNotes(item.word, notes);
		if (notes) {
			setOpenDef(false);
		}
	};

	return (
	<div className="spotlight-container">
	  <div className="spotlight-wrapper">
	    <div className="spotlight">
	      <Scramble item={item} word={item.word} />
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
	        { openDef ? (
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
	      <div className={'of-interest' + (openDef ? ' open' : ' closed')}>
	        {item.def}
	      </div>
	    </div>
	    <div className="button-wrapper">
	      <div className="btn btn-info btn-lg" onClick={handleAnother}>Another</div>
	    </div>
	  </div>
	</div>
	);
}

export default withRouter(Spotlight);
