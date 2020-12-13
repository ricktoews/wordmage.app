import { useEffect, useRef } from 'react';
import { itemToObj } from '../utils/helpers';
import WordsInterface from '../utils/words-interface';
import DeleteIcon from './DeleteIcon';
import EditIcon from './EditIcon';

function WordItem(props) {
	const wordArray = WordsInterface.fullWordList();
	const wordObj = WordsInterface.getWordObj(props.word);
	const word = props.word;
	const def = wordObj.def;
	//const isCustom = wordObj.custom;
	const className = wordObj.spotlight ? 'spotlight' : '';
	const isCustom = WordsInterface.isCustom(word);
	const startRef = useRef(null);

	useEffect(() => {
		if (props.browse) {
			props.setStartWord(startRef);
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
	  {props.starthere ? <div ref={startRef}></div> : null}
	  <div className="list-item">
	    <div className="list-word">{word}</div>
	    {isCustom ? (
	      <div className={'list-button-wrapper' + (isCustom ? '' : ' hide-section')}>
	        <EditIcon onClick={() => { props.popupWordForm(word)} } />
	        <DeleteIcon onClick={() => { props.popupConfirm(word)} } />
	      </div>)
	              : null }
	  </div>
	  <div className="list-def">{def}</div>
	</li>
	);
}

export default WordItem;

