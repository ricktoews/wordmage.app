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

/*
	const goToLetter = (letter) => {
console.log('Go to', letter);
	}
*/

	return (
	<div className="word-list-wrapper">
	  { props.addWordState ? <AddWord cancelAddWord={props.cancelAddWord} updateWordList={updateWordList} /> : <div/> }
	  <ul className="word-list">
            { wordList.map((word, key) => <WordItem key={key} word={word} toggleActive={toggleActive} />)}
	  </ul>
{/*
	  <ul className="alphabet">
	    { alphabet.map((letter, key) => <LetterItem key={key} letter={letter} goToLetter={goToLetter} />)}
	  </ul>
*/}
	</div>
	);
}

export default WordList;

