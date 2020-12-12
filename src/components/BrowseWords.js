import { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import WordItem from './WordItem';
import WordsInterface from '../utils/words-interface';

const wordObjList = WordsInterface.fullWordList();
const wordList = Object.keys(wordObjList);
const listLength = 10;

function BrowseWords(props) {
	const [ wordListSubset, setWordListSubset ] = useState(wordList.slice(0, listLength));
	const [ startHere, setStartHere ] = useState('');
	const listRef = useRef(null);
	const loadingRef = useRef(null);

	const myObserverCallback = (entries, observer) => {
		var listStart = listRef.current.attributes.start;
		listRef.current.attributes.end += listLength;
		var listEnd = listRef.current.attributes.end;
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				var newSubset = wordList.slice(listStart, listEnd);
				setWordListSubset(newSubset);
			}
		});
	};

	useEffect(() => {
		var intersectionObserver = new IntersectionObserver(myObserverCallback, { root: null, rootMargin: '0px', threshold: .1});
		intersectionObserver.observe(loadingRef.current);

		return () => { console.log('disconnect observer'); intersectionObserver.disconnect(); }
	}, []);

	useEffect(() => {
		var startingWord = startHere;
		var startingNdx = 0;
		var foundStart = false;
		for (let i = 0; i < wordList.length && !foundStart; i++) {
			if (wordList[i] >= startingWord) {
				foundStart = true;
				startingWord = wordList[i];
				startingNdx = i;
				listRef.current.attributes.start = i;
				listRef.current.attributes.end = i + listLength;
			}
		}
		setWordListSubset(wordList.slice(startingNdx, startingNdx + listLength));
	}, [startHere]);


	var partialWordTimer;
	const handlePartialWord = e => {
		var el = e.target;
		var partial = el.value.toLowerCase();
		partialWordTimer = setTimeout(() => {
			console.log('handlePartialWord', partial);
			setStartHere(partial);
			window.scrollTo(0,0);
			el.blur();
		}, 1000);
	};

	const toggleActive = word => {
		props.toggleActive(word);
	}

	return (
	<div className="browse-container">
	  <div className="browse">
	    <input type="text" className="partial-word" onChange={handlePartialWord} />
	  </div>

	  <div className="word-list-container">
	    <div className="word-list-wrapper">
	      <ul ref={listRef} className="word-list">
	        { wordListSubset.map((word, key) => <WordItem key={key} browse={true} word={word} toggleActive={toggleActive} popupConfirm={word => { props.popupConfirm(word) }} popupWordForm={word => { props.popupWordForm(word) }} />)}
	        <li className="list-loading-container"><div ref={loadingRef} className="list-loading-marker"></div></li>
	      </ul>
	    </div>
	  </div>

	</div>
	);
}

export default withRouter(BrowseWords);

