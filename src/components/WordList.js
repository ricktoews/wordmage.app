import { useEffect, useState } from 'react';
import WordItem from './WordItem';
import LetterItem from './LetterItem';
import AddWord from './AddWord';
import WordsInterface from '../utils/words-interface';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function WordList(props) {
	const [editWordState, setEditWordState] = useState(false);
	const [editWordItem, setEditWordItem] = useState({});
	const wordList = Object.keys(WordsInterface.fullWordList()).sort();

	const toggleActive = word => {
		props.toggleActive(word);
	}

	const updateWordList = () => {
		props.updateWordList();
	}

	const cancelEdit = () => {
		setEditWordItem('');
		setEditWordState(false);
	}

	const handleEdit = (word) => {
		if (word) {
			let def = props.fullWordList[word];
			setEditWordItem({ word, def });
			setEditWordState(true);
		}
	};

	return (
	<div className="word-list-wrapper">
	  {/* props.addWordState ? <AddWord cancelAddWord={props.cancelAddWord} updateWordList={updateWordList} /> : <div/> }
	  { editWordState ? <AddWord cancelAddWord={cancelEdit} updateWordList={updateWordList} editWordItem={editWordItem}/> : <div/> */}
	  <ul className="word-list">
            { wordList.map((word, key) => <WordItem key={key} word={word} toggleActive={toggleActive} popupConfirm={word => { props.popupConfirm(word) }} popupWordForm={word => { props.popupWordForm(word) }} />)}
	  </ul>
	</div>
	);
}

export default WordList;

