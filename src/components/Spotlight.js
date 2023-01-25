import { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import OpenCloseIcon from './icons/OpenCloseIcon';
import WordsInterface from '../utils/words-interface';
import Scramble from './Scramble';

function Spotlight(props) {
	// Check state for selected scrambled word.
	const state = props.location.state;
	// Check for word to be scrambled, passed in with URL.
	const spotlightWord = props.match?.params?.word;
	const [randomPick, setRandomPick] = useState(!spotlightWord && state === undefined ? true : false);
	var scrambledItem;
	if (randomPick === false) {
		// Not random if word was passed via URL or state.
		if (spotlightWord) {
			scrambledItem = WordsInterface.getWordObjByWord(spotlightWord);
		} else if (state) {
			scrambledItem = state.wordObj;
		} else {
			scrambledItem = WordsInterface.getSpotlightItem();
		}
	}
	else {
		scrambledItem = WordsInterface.getSpotlightItem();
	}
	const [item, setItem] = useState(scrambledItem);

	useEffect(() => {
		if (props.match.params.word && props.match.params.def) {
			let { word, def } = props.match.params;
			WordsInterface.saveCustomWord(-1, word, def);
			props.history.push('/spotlight-list');
		} else if (item.word === '') {
			props.history.push('/browse');
		}
	}, []);

	const handleAnother = e => {
		var anotherItem = WordsInterface.getSpotlightItem();
		setItem(anotherItem);
	};

	return (
	<div className="spotlight-container">
	  <div className="spotlight-wrapper">
	    <div className="spotlight">
		  <div className="word-item-def-container">
	        <div aria-label="def" className="word-item-def">
	          {item.def}
	        </div>
		  </div>
	      <Scramble item={item} word={item.word} />

	    </div>
	    <div className="button-wrapper">
	      <button className={'badge badge-another'} onClick={handleAnother}><i className="glyphicon glyphicon-play"></i> Another</button>
	    </div>
	  </div>
	</div>
	);
}

export default withRouter(Spotlight);
