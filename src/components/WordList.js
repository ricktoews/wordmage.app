import WordItem from './WordItem';
import LetterItem from './LetterItem';
import AddWord from './AddWord';
import WordsInterface from '../utils/words-interface';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function WordList(props) {
	const wordList = Object.keys(props.fullWordList).sort();
console.log('WordList addWordState', props);

	const toggleActive = word => {
		props.toggleActive(word);
	}

	const updateWordList = () => {
		props.updateWordList();
	}

	return (
	<div className="word-list-wrapper">
	  { props.addWordState ? <AddWord cancelAddWord={props.cancelAddWord} updateWordList={updateWordList} /> : <div/> }
	  <ul className="word-list">
            { wordList.map((word, key) => <WordItem key={key} word={word} toggleActive={toggleActive} />)}
	  </ul>
	</div>
	);
}

export default WordList;

