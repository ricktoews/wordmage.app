import { itemToObj } from '../utils/helpers';
import WordsInterface from '../utils/words-interface';
import DeleteIcon from './DeleteIcon';
import EditIcon from './EditIcon';

function WordItem(props) {
	const wordHash = WordsInterface.fullWordList();
	const def = props.def ? props.def : wordHash[props.word];
	const className = WordsInterface.isActiveEntry(props.word) ? 'active' : '';
	const isCustom = 1||WordsInterface.isCustom(props.word);
	
	const toggleActiveHandler = e => {
		var el = e.target;
		if (el.tagName === 'DIV') {
			props.toggleActive(props.word);
		}
	};

	return (
	<li className={className} onClick={toggleActiveHandler}>
	  <div className="list-item">
	    <div className="list-word">{props.word}</div>
	    {true || props.browse ? null : <div className={'list-button-wrapper' + (isCustom ? '' : ' hide-section')}>
	      <EditIcon onClick={() => { props.popupWordForm(props.word)} } />
	      <DeleteIcon onClick={() => { props.popupConfirm(props.word)} } />
	    </div>}
	  </div>
	  <div className="list-def">{def}</div>
	</li>
	);
}

export default WordItem;

