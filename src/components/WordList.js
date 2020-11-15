import WordItem from './WordItem';
import LetterItem from './LetterItem';

import wordHash from '../data/word-list.json';

const wordList = Object.keys(wordHash).sort();

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function WordList(props) {
	const toggleActive = word => {
		props.toggleActive(word);
	}

	const goToLetter = (letter) => {
console.log('Go to', letter);
	}

	return (
	<div className="word-list-wrapper">
	  <ul className="word-list">
            { wordList.map((word, key) => <WordItem key={key} word={word} toggleActive={toggleActive} />)}
	  </ul>
	  <ul className="alphabet">
	    { alphabet.map((letter, key) => <LetterItem key={key} letter={letter} goToLetter={goToLetter} />)}
	  </ul>
	</div>
	);
}

export default WordList;

