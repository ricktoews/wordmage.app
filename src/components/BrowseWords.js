import { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import WordItem from './WordItem';
import WordsInterface from '../utils/words-interface';

const wordObjList = WordsInterface.fullWordList();
const wordList = wordObjList.map(item => item.word);
const listLength = 10;

function BrowseWords(props) {
	const [ wordListSubset, setWordListSubset ] = useState(wordList.slice(0, listLength));
	const [ startHere, setStartHere ] = useState(props.match.params.start || '');
	const [ startingWord, setStartingWord ] = useState('');
	const [ startRef, setStartRef] = useState(null);
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
		var startingNdx = 0;
		var foundStart = false;
		for (let i = 0; i < wordList.length && !foundStart; i++) {
			if (wordList[i] >= startHere) {
				foundStart = true;
				setStartingWord(wordList[i]);
				startingNdx = i;
				listRef.current.attributes.start = startingNdx;
				listRef.current.attributes.end = startingNdx + listLength;
			}
		}
		setWordListSubset(wordList.slice(startingNdx, startingNdx + listLength));
	}, [startHere]);

	useEffect(() => {
if (startRef) {
		startRef.current.scrollIntoView();
console.log('setting start ref to scroll to', startRef.current, window.pageYOffset);
}
	}, [startRef]);

	var partialWordTimer;
	const handlePartialWord = e => {
		var el = e.target;
		var partial = el.value.toLowerCase();
		partialWordTimer = setTimeout(() => {
			console.log('handlePartialWord', partial);
			window.scrollTo(0,0);
			// For some reason, we seem to have to set this state, even though we're pushing to history.
			setStartHere(partial);
			props.history.push('/browse/' + partial);
			el.blur();
		}, 1000);
	};

	const toggleSpotlight = word => {
		props.toggleSpotlight(word);
	}

	const setStartWord = (ref) => {
		if (ref.current) {
			setStartRef(ref);
		}
	};

	return (
	<div className="browse-container">
	  <div className="browse">
	    <input type="text" className="partial-word" onChange={handlePartialWord} />
	  </div>

	  <div className="word-list-container">
	    <div className="word-list-wrapper">
	      <ul ref={listRef} className="word-list">
	        { wordListSubset.map((word, ndx) => {
	            if (startingWord === word) {
	                return <WordItem key={ndx} setStartWord={setStartWord} browse={true} starthere={true} word={word} toggleSpotlight={toggleSpotlight} popupConfirm={word => { props.popupConfirm(word) }} popupWordForm={word => { props.popupWordForm(word) }} />
	            } else {
	                return <WordItem key={ndx} browse={true} setStartWord={setStartWord} word={word} toggleSpotlight={toggleSpotlight} popupConfirm={word => { props.popupConfirm(word) }} popupWordForm={word => { props.popupWordForm(word) }} />
	            }
	        })}

	        <li className="list-loading-container"><div ref={loadingRef} className="list-loading-marker"></div></li>
	      </ul>
	    </div>
	  </div>

	</div>
	);
}

export default withRouter(BrowseWords);

