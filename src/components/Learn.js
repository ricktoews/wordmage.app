import { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import WordScroller from './WordScroller';
import WordsInterface from '../utils/words-interface';

//const wordObjList = WordsInterface.fullWordList();

function sortWords(a, b) {
	return a.word < b.word ? -1 : 1;
}

function Learn(props) {
	const learnList = WordsInterface.getWordList('learn').sort(sortWords);

	return (
		<div className="learn-list-container">
			<div className="learn-toolbar">
				<div className="learn-toolbar-title">Learn</div>
			</div>
			<WordScroller pool={learnList} startingNdx={0} listType={'learn'} popupWordForm={props.popupWordForm} />
		</div>
	);
}

export default withRouter(Learn);



