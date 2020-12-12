import { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import WordItem from './WordItem';
import WordsInterface from '../utils/words-interface';

const wordObjList = WordsInterface.fullWordList();
const wordList = Object.keys(wordObjList);
const listLength = 10;

function SpotlightList(props) {
	const [wordList, setWordList] = useState( Object.keys( WordsInterface.getWordList('spotlight')).sort() );
console.log('SpotlightList', wordList);
	const toggleActive = word => {
		props.toggleActive(word);
	}

	return (
	<div className="spotlight-list-container">
	  <div className="word-list-container">
	    <div className="word-list-wrapper">
	      <ul className="word-list">
               { wordList.map((word, key) => <WordItem key={key} word={word} toggleActive={toggleActive} popupConfirm={word => { props.popupConfirm(word) }} popupWordForm={word => { props.popupWordForm(word) }} />)}
	      </ul>
	    </div>
	  </div>

	</div>
	);
}

export default withRouter(SpotlightList);


