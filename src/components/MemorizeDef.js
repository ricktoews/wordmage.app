import { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import OpenCloseIcon from './icons/OpenCloseIcon';
import WordsInterface from '../utils/words-interface';

function MemorizeDef(props) {
	const state = props.location.state;
	const [randomPick, setRandomPick] = useState(state === undefined ? true : false);
	var memDefItem;
	if (randomPick === false) {
		memDefItem = state.wordObj;
console.log('MemorizeDef randomPick is false', memDefItem);
	}
	else {
		memDefItem = WordsInterface.getMemDefItem();
console.log('MemorizeDef randomPick is true', memDefItem);
	}
	const [item, setItem] = useState(memDefItem);

	useEffect(() => {
/*
		if (props.match.params.word) {
			let { word, mem } = props.match.params;
			WordsInterface.saveCustomWord(-1, word, mem);
			props.history.push('/spotlight-list');
		} else if (item.word === '') {
			props.history.push('/browse');
		}
*/
	}, []);

	const handleAnother = e => {
		var anotherItem = WordsInterface.getMemDefItem();
		setItem(anotherItem);
	};

	return (
	<div className="spotlight-container">
	  <div className="spotlight-wrapper">
	    <div className="spotlight">
	      <div aria-label="word" className="word-item-word">
	        {item.word}
	      </div>
	      <div aria-label="mem" className="word-item-mem">
	        {item.mem}
	      </div>

	    </div>
	    <div className="button-wrapper">
	      <button className={'badge badge-another'} onClick={handleAnother}><i className="glyphicon glyphicon-play"></i> Another</button>
	    </div>
	  </div>
	</div>
	);
}

export default withRouter(MemorizeDef);
