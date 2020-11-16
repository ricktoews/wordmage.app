import WordItem from './WordItem';
import LetterItem from './LetterItem';
import WordsInterface from '../utils/words-interface';

function ArchiveList(props) {
	const wordList = Object.keys(props.archiveWordList).sort();
console.log('ArchiveList', props.archiveWordList, wordList);
	const toggleActive = word => {
		props.toggleActive(word);
	}

	const updateWordList = () => {
		props.updateWordList();
	}

	return (
	<div className="word-list-wrapper">
	  <ul className="word-list">
            { wordList.map((word, key) => <WordItem key={key} word={word} toggleActive={toggleActive} />)}
	  </ul>
	</div>
	);
}

export default ArchiveList;

