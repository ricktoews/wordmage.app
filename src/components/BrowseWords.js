import { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import WordItem from './WordItem';
import WordsInterface from '../utils/words-interface';

//const wordObjList = WordsInterface.fullWordList();
//const wordList = wordObjList.map(item => item.word);
const listLength = 20;
const listIncrement = 30;

function BrowseWords(props) {
	const [ wordObjList, setWordObjList ] = useState(WordsInterface.fullWordList());
	const [ wordList, setWordList ] = useState(wordObjList.map(item => item.word));
	const [ wordListSubset, setWordListSubset ] = useState([]);
	const [ startingLetters, setStartingLetters ] = useState(props.match.params.start || '');
	const [ browseMode, setBrowseMode ] = useState('built-in');
	const listRef = useRef(null);
	const loadingRef = useRef(null);

	const myObserverCallback = (entries, observer) => {
		var listStart = listRef.current.attributes.start;
		listRef.current.attributes.end += listIncrement;
		var listEnd = listRef.current.attributes.end;
console.log('myObserverCallback browseMode', listRef.current.attributes.browseMode);
		if (!listRef.current.attributes.browseMode || listRef.current.attributes.browseMode === 'built-in') {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					var newSubset = wordList.slice(listStart, listEnd);
					setWordListSubset(newSubset);
				}
			});
		}
	};

	useEffect(() => {
		console.log('useEffect, browseMode', browseMode);
	}, [browseMode]);

	useEffect(() => {
		var intersectionObserver = new IntersectionObserver(myObserverCallback, { root: null, rootMargin: '0px', threshold: .1});
		intersectionObserver.observe(loadingRef.current);

		return () => { console.log('disconnect observer'); intersectionObserver.disconnect(); }
	}, []);


	useEffect(() => {
		if (browseMode === 'built-in') {
			var startingNdx = 0;
			var foundStart = false;
			for (let i = 0; i < wordList.length && !foundStart; i++) {
				if (wordList[i].toLowerCase().localeCompare(startingLetters) >= 0) {
					foundStart = true;
					startingNdx = i;
					listRef.current.attributes.start = startingNdx;
					listRef.current.attributes.end = startingNdx + listLength;
				}
			}
			setWordListSubset(wordList.slice(startingNdx, startingNdx + listLength));
		}
	}, [startingLetters, browseMode]);


	var partialWordTimer;
	const handlePartialWord = e => {
		var el = e.target;
		var partial = el.value.toLowerCase();
		// Meant to fix scrolling issue. The issue seems to be caused by successive partial
		// searches, from different timers set on the same input: e.g., from 'Let'.
		// To test this, set the timeout to 2000 and comment out this clearTimeout line.
		if (partialWordTimer) {
			clearTimeout(partialWordTimer);
		}
		partialWordTimer = setTimeout(() => {
			window.scrollTo(0,0);
			// For some reason, we seem to have to set this state, even though we're pushing to history.
			setStartingLetters(partial);
			props.history.push('/browse/' + partial);
			el.blur();
		}, 1000);
	};

	const toggleSpotlight = word => {
		props.toggleSpotlight(word);
		// We should update wordObjList here.
		// ... and this does work. the above props.toggleSpotlight calls toggleSpotlight in App.js,
		// which calls WordsInterface.toggleSpotlight, updating the spotlight flag for this word.
		setWordObjList(WordsInterface.fullWordList());
	}

	const handleBrowseCustom = e => {
		if (browseMode !== 'custom') {
			let filteredWordList = wordObjList.filter(obj => obj.myown).map(item => item.word);
			setWordListSubset(filteredWordList);
			setBrowseMode('custom');
			listRef.current.attributes.browseMode = 'custom';
		} else {
			setStartingLetters('');
			setBrowseMode('built-in');
			props.history.push('/browse/');
			listRef.current.attributes.browseMode = 'built-in';
		}
	}

	const handleBrowseSpotlight = e => {
		if (browseMode !== 'spotlight') {
			let filteredWordList = wordObjList.filter(obj => obj.spotlight).map(item => item.word);
			setWordListSubset(filteredWordList);
			setBrowseMode('spotlight');
			listRef.current.attributes.browseMode = 'spotlight';
		} else {
			setStartingLetters('');
			setBrowseMode('built-in');
			props.history.push('/browse/');
			listRef.current.attributes.browseMode = 'built-in';
		}
	}

	return (
	<div className="browse-container">
	  <div className="browse">
	    <input type="text" className="partial-word" onChange={handlePartialWord} placeholder="Jump to" />
	    <div className="browse-filter-buttons">
	      <button className="badge badge-circle badge-spotlight-filter" onClick={handleBrowseCustom}><i className="glyphicon glyphicon-star"></i></button>
	      <button className="badge badge-circle badge-spotlight-filter" onClick={handleBrowseSpotlight}><i className="glyphicon glyphicon-heart"></i></button>
	    </div>
	  </div>

	  <div className="word-list-container">
	    <div className="word-list-wrapper">
	      <ul ref={listRef} className="word-list">
	        { wordListSubset.map((word, ndx) => {
	                return <WordItem key={ndx} 
	                                 word={word} 
	                                 toggleSpotlight={toggleSpotlight} 
	                                 popupConfirm={wordId => { props.popupConfirm(wordId) }} 
	                                 popupWordForm={wordId => { props.popupWordForm(wordId) }} />
	        })}

	        <li className="list-loading-container"><div ref={loadingRef} className="list-loading-marker"></div></li>
	      </ul>
	    </div>
	  </div>

	</div>
	);
}

export default withRouter(BrowseWords);

