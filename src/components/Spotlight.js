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
	const [notes, setNotes] = useState(WordsInterface.getNotes(randomItem.word));

	useEffect(() => {
		if (props.match.params.word) {
			let { word, def } = props.match.params;
			WordsInterface.saveCustomWord(-1, word, def);
			props.history.push('/spotlight-list');
		} else if (item.word === '') {
			props.history.push('/browse');
		}
	}, []);

	const handleAnother = e => {
		var anotherItem = WordsInterface.getSpotlightItem();
		setItem(anotherItem);
	};

	const handleSetNotes = e => {
		var el = e.target;
		var content = el.textContent;
		WordsInterface.saveNotes(item._id, content);
	};


	const handleSetCustomDef = e => {
		var el = e.target;
		var content = el.textContent;
		WordsInterface.saveCustomDef(item._id, content);
	};

	const handleClearCustom = e => {
		e.preventDefault();
		var el = e.target;
		var content = '';
		let currentItem = WordsInterface.saveCustomDef(item._id, content);
		setItem(currentItem);
	}

	return (
	<div className="spotlight-container">
	  <div className="spotlight-wrapper">
	    <div className="spotlight">
	      <Scramble item={item} word={item.word} />
	      <div aria-label="def" className="user-notes" contentEditable={true} suppressContentEditableWarning={true} onBlur={handleSetCustomDef}>
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
