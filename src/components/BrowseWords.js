import ReactDOM from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import WordScroller from './WordScroller';
import WordItem from './WordItem';
import WordsInterface from '../utils/words-interface';

const INFINITE_SCROLLING_ON = 'list-loading-container';
const INFINITE_SCROLLING_OFF = 'hide-section';
const listLength = 20;
const listIncrement = 30;


function BrowseWords(props) {
	const fullWordObjList = WordsInterface.fullWordList();
	const fullWordList = fullWordObjList.map(item => item.word);
	const [ wordObjList, setWordObjList ] = useState(fullWordObjList);
	const [ wordList, setWordList ] = useState(fullWordList);
	const [ wordListSubset, setWordListSubset ] = useState([]);
	const [ startingLetters, setStartingLetters ] = useState(props.match.params.start || '');
	const [ startingNdx, setStartingNdx ] = useState(0);
	const [ browseMode, setBrowseMode ] = useState('built-in');
	const [ listLoadClass, setListLoadClass ] = useState(INFINITE_SCROLLING_ON);

	const scrollerRef = useRef(null);
	const sentinelRef = useRef(null);


	// Separate this into its own function, since it's used in a couple of places.
	// Oh: you want to know what it actually DOES, do you? ...
	// OK, fine. This builds a subset of words from the full list of words. It takes a slice defined by
	// the listLength const (20) and beginning at the user-specified point (startingLetters, from the 
	// search field) or at the beginning of the alphabet.
	const builtInSubset = () => {
		var ndx = -1;
		for (let i = 0; i < wordList.length && ndx === -1; i++) {
			if (wordList[i].toLowerCase().localeCompare(startingLetters) >= 0) {
				ndx = i;
				setStartingNdx(ndx);
			}
		}
	}

	// First step in updating word list on add / delete custom word.
	// Update wordObjList, wordList, which changes the wordList.length and gets to second step, below.
	useEffect(() => {
		setWordObjList(fullWordObjList);
		setWordList(fullWordList);
	}, [fullWordObjList.length]);

	// Second step in updating word list on add / delete custom word.
	// When the wordList length changes, that's the signal to rebuild the word list subset with builtInSubset().
	useEffect(() => {
		builtInSubset();
	}, [wordList.length]);


	useEffect(() => {
		if (browseMode === 'built-in') {
			builtInSubset();
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
			setListLoadClass(INFINITE_SCROLLING_OFF);
			scrollerRef.current.attributes.browseMode = 'custom';
		} else {
			setStartingLetters('');
			setBrowseMode('built-in');
			setListLoadClass(INFINITE_SCROLLING_ON);
			props.history.push('/browse/');
			scrollerRef.current.attributes.browseMode = 'built-in';
		}
	}

	const handleBrowseSpotlight = e => {
		if (browseMode !== 'spotlight') {
			let filteredWordList = wordObjList.filter(obj => obj.spotlight).map(item => item.word);
			setWordListSubset(filteredWordList);
			setBrowseMode('spotlight');
			setListLoadClass(INFINITE_SCROLLING_OFF);
			scrollerRef.current.attributes.browseMode = 'spotlight';
		} else {
			setStartingLetters('');
			setBrowseMode('built-in');
			setListLoadClass(INFINITE_SCROLLING_ON);
			props.history.push('/browse/');
			scrollerRef.current.attributes.browseMode = 'built-in';
		}
	}

	const spotlightFilterClass = browseMode === 'spotlight' ? 'badge-spotlight-filter' : 'badge-spotlight-filter-off';
	const customFilterClass = browseMode === 'custom' ? 'badge-custom-filter' : 'badge-custom-filter-off';

	return (
	<div className="browse-container">
	  <div className="browse">
	    <input type="text" className="partial-word" onChange={handlePartialWord} placeholder="Jump to" />
{/*
	    <div className="browse-filter-buttons">
	      <button className={'badge ' + customFilterClass} onClick={handleBrowseCustom}><i className="glyphicon glyphicon-star"></i></button>
	      <button className={'badge ' + spotlightFilterClass} onClick={handleBrowseSpotlight}><i className="glyphicon glyphicon-heart"></i></button>
	    </div>
*/}
	  </div>

	  <WordScroller pool={fullWordObjList} startingNdx={startingNdx} />
	</div>
	);
}

export default withRouter(BrowseWords);

