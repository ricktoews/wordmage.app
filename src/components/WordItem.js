import { useState } from 'react';
import WordsInterface from '../utils/words-interface';
import DeleteIcon from './DeleteIcon';
import EditIcon from './EditIcon';
import EditModal from './EditModal';
//import DeleteModal from './DeleteModal';
import useModal from '../hooks/useModal';

function WordItem(props) {
	const { isShowing, toggle } = useModal();
	const wordArray = WordsInterface.fullWordList();
	const wordObj = WordsInterface.getWordObj(props.word);
	const wordId = wordObj._id;
	const word = props.word;
	const def = wordObj.def;
	const isMyOwn = !!wordObj.myown;
	const className = wordObj.spotlight ? 'spotlight' : '';
	const spotlightMarker = wordObj.spotlight ? <i className="spotlight-marker glyphicon glyphicon-heart"></i> : null;
	const isCustom = WordsInterface.isCustom(word);
	const { showEditModal, setShowEditModal } = useState(false);
	const { showDeleteModal, setShowDeleteModal } = useState(false);

	const cancelWordForm = () => {
		console.log('cancel word form');
document.getElementById('popup').style.display = 'none';
	}

	const popupConfirm = (wordId) => {
		console.log('popupConfirm', wordId);
	}

	const toggleSpotlightHandler = e => {
		var el = e.target;
console.log('toggleSpotlightHandler', el.tagName, props.word);
/*
		if (el.tagName === 'DIV') {
			props.toggleSpotlight(props.word);
		}
*/
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
	        <EditIcon onClick={toggle} />
	        <DeleteIcon onClick={toggle} />
	        <EditModal {...wordObj} show={isShowing} hide={toggle} wordId={wordId} />
{/*	        <DeleteModal show={isShowing} hide={toggle} word-id={wordId} /> */}
	      </div>)
	              : null }
	  </div>
	  <div className="list-def">{def}</div>
	</li>
	);
}

export default WordItem;

