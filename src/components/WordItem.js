import { useEffect, useRef } from 'react';
import WordsInterface from '../utils/words-interface';
import DeleteIcon from './DeleteIcon';
import EditIcon from './EditIcon';

function WordItem(props) {
	const wordArray = WordsInterface.fullWordList();
	const wordObj = WordsInterface.getWordObj(props.word);
	const wordId = wordObj._id;
	const word = props.word;
	const def = wordObj.def;
	const isMyOwn = !!wordObj.myown;
	const className = wordObj.spotlight ? 'spotlight' : '';
	const spotlightMarker = wordObj.spotlight ? <i className="spotlight-marker glyphicon glyphicon-heart"></i> : null;
	const isCustom = WordsInterface.isCustom(word);

	useEffect(() => {
		if (props.browse) {
//			props.setStartWord(startRef);
		}
	}, []);
	
	const toggleSpotlightHandler = e => {
		var el = e.target;
		if (el.tagName === 'DIV') {
			props.toggleSpotlight(props.word);
		}
	};

	return (
	<li className={className} onClick={toggleSpotlightHandler}>
	  <div className="list-item">
	    { isMyOwn ? (
	    <div className="list-word">{spotlightMarker}{word} <i className="glyphicon glyphicon-star flag-my-own"></i></div>
	    ) : (
	    <div className="list-word">{spotlightMarker}{word}</div>
	    )}

	    { isCustom ? (
	      <div className={'list-button-wrapper' + (isCustom ? '' : ' hide-section')}>
	        <EditIcon onClick={() => { props.popupWordForm(wordId)} } />
	        <DeleteIcon onClick={() => { props.popupConfirm(wordId)} } />
	      </div>)
	              : null }
	  </div>
	  <div className="list-def">{def}</div>
	</li>
	);
}

export default WordItem;

