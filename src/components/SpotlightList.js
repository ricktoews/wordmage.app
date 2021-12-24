import { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import WordScroller from './WordScroller';
import WordsInterface from '../utils/words-interface';

//const wordObjList = WordsInterface.fullWordList();
//const wordList = wordObjList.map(item => item.word);
const listLength = 10;

function sortSpotlight(a, b) {
	return a.word < b.word ? -1 : 1;
}

function SpotlightList(props) {
	const wordList = WordsInterface.getWordList('spotlight').map(item => item.word).sort();
	const spotlightWordList = WordsInterface.getWordList('spotlight').sort(sortSpotlight);
	const toggleSpotlight = word => {
		props.toggleSpotlight(word);
	}

	return (
	<div className="spotlight-list-container">
      <div className="browse">
		<p>These are words you want to make special note of, for whatever reason.</p>
      </div>
	  <WordScroller pool={spotlightWordList} startingNdx={0} listType={'liked'} popupWordForm={props.popupWordForm} />
	</div>
	);
}

export default withRouter(SpotlightList);


