import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordItem from './WordItem';
import LetterItem from './LetterItem';
import AddWord from './AddWord';
import WordsInterface from '../utils/words-interface';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function WordList(props) {
	const [editWordState, setEditWordState] = useState(false);
	const [editWordItem, setEditWordItem] = useState({});
	const wordList = Object.keys(WordsInterface.getWordList(props.match.params.listtype)).sort();

	const toggleActive = word => {
		props.toggleActive(word);
	}

	const updateWordList = () => {
		props.updateWordList();
	}

	return (
	<div className="word-list-container">
	  <div className="word-list-wrapper">
	    <ul className="word-list">
              { wordList.map((word, key) => <WordItem key={key} word={word} toggleActive={toggleActive} popupConfirm={word => { props.popupConfirm(word) }} popupWordForm={word => { props.popupWordForm(word) }} />)}
	    </ul>
	  </div>
	</div>
	);
}

export default withRouter(WordList);

