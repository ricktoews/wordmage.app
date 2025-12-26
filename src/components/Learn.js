import { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import WordScroller from './WordScroller';
import WordsInterface from '../utils/words-interface';

//const wordObjList = WordsInterface.fullWordList();

function sortWords(a, b) {
	return a.word < b.word ? -1 : 1;
}


function Learn(props) {
	const learnWordList = WordsInterface.getWordList('learn').sort(sortWords);

	return (
		<div className="spotlight-list-container favorites-page">
			<div className="favorites-toolbar">
				<div className="favorites-toolbar-title">Learn</div>
			</div>
			<WordScroller pool={learnWordList} startingNdx={0} listType={'learn'} popupWordForm={props.popupWordForm} onAIExplain={props.onAIExplain} />
		</div>
	);
}

export default withRouter(Learn);



