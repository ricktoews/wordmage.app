import ReactDOM from 'react-dom';
import { useEffect, useState, useRef, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { WordMageContext } from '../WordMageContext';
import WordScroller from './WordScroller';
import WordsInterface from '../utils/words-interface';
import Popup from './Popup';
import PopupTagFilter from './PopupTagFilter';
import TagFilter from './TagFilter';

const INFINITE_SCROLLING_ON = 'list-loading-container';
const INFINITE_SCROLLING_OFF = 'hide-section';
const listLength = 20;
const listIncrement = 30;


function BrowseWords(props) {
	const { contextValue, setContextValue } = useContext(WordMageContext);

	const fullWordObjList = WordsInterface.fullWordList();
	const fullWordList = fullWordObjList.map(item => item.word);
	const [wordObjList, setWordObjList] = useState(fullWordObjList);
	const [wordList, setWordList] = useState(fullWordList);
	const [startingLetters, setStartingLetters] = useState(props.match.params.start || '');
	const [startingNdx, setStartingNdx] = useState(0);
	const [browseMode, setBrowseMode] = useState('built-in');
	const [showTags, setShowTags] = useState(false);
	const [tagList, setTagList] = useState(WordsInterface.getTagList());
	const [tagFilter, setTagFilter] = useState('');
	const tagFilterRef = useRef(null);


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

	// Here is where we respond to document click.
	// contextValue is set in App.js when document.click is detected.
	useEffect(() => {
		// In addition to checking popup visibility, we verify a click outside of the popup before hiding.
		if (showTags) {
			if (tagFilterRef.current.contains(contextValue.targetEl) === false) {
				setShowTags(false);
			}
		}
	}, [contextValue]);

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

	function tagSelection(discard, tag, checked, closeTagList) {
		console.log('tagSelection', tag, checked, closeTagList);
		setTagFilter(tag);

		// Stolen code. Coopted for showing tagged words.
		let filteredWordObjList = fullWordObjList.filter(obj => obj.tags && obj.tags.indexOf(tag) !== -1);
		console.log('tagSelection, filteredWordList', filteredWordObjList);
		setWordObjList(filteredWordObjList);
		setStartingNdx(0);
		setBrowseMode('tagged');
		//		scrollerRef.current.attributes.browseMode = 'tagged';
		// End stolen code.

		if (closeTagList) {
			setShowTags(false);
		}
	}

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
			window.scrollTo(0, 0);
			// For some reason, we seem to have to set this state, even though we're pushing to history.
			setWordObjList(fullWordObjList);
			setBrowseMode('built-in');
			setTagFilter('');
			setStartingLetters(partial);
			props.history.push('/browse/' + partial);
			el.blur();
		}, 2500);
	};

	const handleCancelTagFilter = e => {
		setTagFilter('');
		setWordObjList(fullWordObjList);
	}

	const handleTagFilter = e => {
		setShowTags(!showTags);
	}

	const customFilterClass = browseMode === 'custom' ? 'badge-custom-filter' : 'badge-custom-filter-off';

	const tagListEl = ref => {
		let el = ref.current;
		let classes = Array.from(el.classList);
		let isPopupActive = classes.indexOf('element-hide') === -1;
		if (isPopupActive) {
			console.log('Should hide popup');
		}
	}

	const handleBackgroundClick = () => {
		setShowTags(false);
	}

	return (
		<div className="browse-container">
			<div className="browse">
				{/* Word search field */}
				<input type="text" autoCapitalize="off" className="partial-word" onChange={handlePartialWord} placeholder="Jump to" />

				{/* Tag filtering UI: Selected tag, tag selection button */}
				<div className="browse-filter-buttons">
					{
						tagFilter
							? (<span><button onClick={handleCancelTagFilter} className="badge"><i className="glyphicon glyphicon-remove"></i></button> {tagFilter}</span>)
							: null
					} <button className={'badge ' + customFilterClass} onClick={handleTagFilter}><i className="glyphicon glyphicon-tag"></i></button>
				</div>
			</div>

			<div ref={tagFilterRef}> {/* Wrap Tag Filter in a div, for checking document click outside. */}
				<Popup isVisible={showTags} handleBackgroundClick={handleBackgroundClick}><PopupTagFilter showTags={showTags} tagListEl={tagListEl} tagList={tagList} tagWord={tagSelection} /></Popup>
			</div>
			<WordScroller pool={wordObjList} startingNdx={startingNdx} popupWordForm={props.popupWordForm} />
		</div>
	);
}

export default withRouter(BrowseWords);

