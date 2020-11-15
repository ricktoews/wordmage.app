import { itemToObj } from '../utils/helpers';
import WordsInterface from '../utils/words-interface';
import wordHash from '../data/word-list.json';

function WordItem(props) {
	const def = wordHash[props.word];

	const className = WordsInterface.isActiveEntry(props.word) ? 'active' : '';
	
	const toggleActiveHandler = e => {
		props.toggleActive(props.word);
	};

	return (
	<li className={className} onClick={toggleActiveHandler}>{props.word}: {def}</li>
	);
}

export default WordItem;

