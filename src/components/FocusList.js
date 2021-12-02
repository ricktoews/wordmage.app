import { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import WordScroller from './WordScroller';
import WordItem from './WordItem';
import WordsInterface from '../utils/words-interface';

const wordObjList = WordsInterface.fullWordList();

function sortWords(a, b) {
	return a.word < b.word ? -1 : 1;
}

function FocusList(props) {
	const focusWordList = WordsInterface.getWordList('focus').sort(sortWords);
	const toggleFocus = word => {
		props.toggleFocus(word);
	}

	return (
	<div className="focus-list-container">
	  <WordScroller pool={focusWordList} startingNdx={0} listtype={'focus'} />
	</div>
	);
}

export default withRouter(FocusList);



