import ReactDOM from 'react-dom';
import { useEffect, useState, useRef, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faTag, faPlus, faRandom, faComment } from '@fortawesome/free-solid-svg-icons';
import { WordMageContext } from '../WordMageContext';
import WordScroller from './WordScroller';
import WordsInterface from '../utils/words-interface';
import { getWordsPage } from '../utils/api';
import Popup from './Popup';
import PopupTagFilter from './PopupTagFilter';
import TagFilter from './TagFilter';

const INFINITE_SCROLLING_ON = 'list-loading-container';
const INFINITE_SCROLLING_OFF = 'hide-section';
const listLength = 20;
const listIncrement = 30;


function BrowseWords(props) {
	const { contextValue, setContextValue } = useContext(WordMageContext);

	const [wordObjList, setWordObjList] = useState([]);
	const [startingLetters, setStartingLetters] = useState(props.match.params.start || 'a');
	const [hasMore, setHasMore] = useState(true);
	const [nextCursor, setNextCursor] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [browseMode, setBrowseMode] = useState('api');
	const [showTags, setShowTags] = useState(false);
	const [tagList, setTagList] = useState(WordsInterface.getTagList());
	const [tagFilter, setTagFilter] = useState('');
	const tagFilterRef = useRef(null);

	// Load initial page or new starting point
	const loadInitialPage = async (startsWith = 'a') => {
		setIsLoading(true);
		try {
			const response = await getWordsPage({ starts_with: startsWith });
			setWordObjList(response.words);
			setHasMore(response.has_more);
			setNextCursor(response.next_cursor);
		} catch (error) {
			console.error('Error loading words page:', error);
		} finally {
			setIsLoading(false);
		}
	};

	// Load more words for pagination
	const loadMoreWords = async () => {
		console.log('loadMoreWords called - hasMore:', hasMore, 'isLoading:', isLoading, 'nextCursor:', nextCursor);
		if (!hasMore || isLoading || !nextCursor) {
			console.log('Skipping load - conditions not met');
			return;
		}

		setIsLoading(true);
		console.log('Loading more words from cursor:', nextCursor);
		try {
			const response = await getWordsPage({
				starts_with: startingLetters,
				after_word: nextCursor
			});
			console.log('Received', response.words.length, 'more words. has_more:', response.has_more);
			setWordObjList(prev => [...prev, ...response.words]);
			setHasMore(response.has_more);
			setNextCursor(response.next_cursor);
		} catch (error) {
			console.error('Error loading more words:', error);
		} finally {
			setIsLoading(false);
		}
	};

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

	// Load initial page when component mounts or starting letters change
	useEffect(() => {
		if (browseMode === 'api') {
			loadInitialPage(startingLetters);
		}
	}, [startingLetters, browseMode]);

	function tagSelection(discard, tag, checked, closeTagList) {
		setTagFilter(tag);

		// For now, tag filtering still uses local data
		const fullWordObjList = WordsInterface.fullWordList();
		let filteredWordObjList = fullWordObjList.filter(obj => obj.tags && obj.tags.indexOf(tag) !== -1);
		setWordObjList(filteredWordObjList);
		setBrowseMode('tagged');
		setHasMore(false); // No pagination for tagged mode

		if (closeTagList) {
			setShowTags(false);
		}
	}

	var partialWordTimer;
	const handlePartialWord = e => {
		var el = e.target;
		var partial = el.value.toLowerCase();
		if (partialWordTimer) {
			clearTimeout(partialWordTimer);
		}
		partialWordTimer = setTimeout(() => {
			window.scrollTo(0, 0);
			setBrowseMode('api');
			setTagFilter('');
			setStartingLetters(partial);
			props.history.push('/browse/' + partial);
			el.blur();
		}, 2500);
	};

	const handleCancelTagFilter = e => {
		setTagFilter('');
		setBrowseMode('api');
		loadInitialPage(startingLetters);
	}

	const handleRandomJump = () => {
		// Generate a random 5-letter string
		const letters = 'abcdefghijklmnopqrstuvwxyz';
		let randomString = '';
		for (let i = 0; i < 5; i++) {
			randomString += letters.charAt(Math.floor(Math.random() * letters.length));
		}

		window.scrollTo(0, 0);
		setBrowseMode('api');
		setTagFilter('');
		setStartingLetters(randomString);
		props.history.push('/browse/' + randomString);
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
		<div className="browse-container browse-page">
			<div className="browse-toolbar">
				<div className="browse-toolbar-title">Browse</div>
				<div className="browse-toolbar-search">
					<input type="text" autoCapitalize="off" className="partial-word" onChange={handlePartialWord} placeholder="Jump to" />
				</div>
				<div className="browse-filter-buttons">
					{
						tagFilter
							? (<span><button onClick={handleCancelTagFilter} className="badge"><FontAwesomeIcon icon={faXmark} /></button> {tagFilter}</span>)
							: null
					}
					{false && <button className={'badge ' + customFilterClass} onClick={handleTagFilter}><FontAwesomeIcon icon={faTag} /></button>}
					{false && <button className="badge badge-add-word" onClick={() => props.popupWordForm()}><FontAwesomeIcon icon={faPlus} /></button>}
					<button className="badge badge-random-jump" onClick={handleRandomJump} title="Jump to a random location">
						<FontAwesomeIcon icon={faRandom} />
					</button>
					{props.botpressButton && <button className="badge badge-botpress" onClick={props.toggleWebchat}><FontAwesomeIcon icon={faComment} /></button>}
				</div>
			</div>			<div ref={tagFilterRef}> {/* Wrap Tag Filter in a div, for checking document click outside. */}
				<Popup isVisible={showTags} handleBackgroundClick={handleBackgroundClick}><PopupTagFilter showTags={showTags} tagListEl={tagListEl} tagList={tagList} tagWord={tagSelection} /></Popup>
			</div>
			<WordScroller
				pool={wordObjList}
				startingNdx={0}
				listType={'browse'}
				popupWordForm={props.popupWordForm}
				onAIExplain={props.onAIExplain}
				hasMore={hasMore}
				onLoadMore={loadMoreWords}
				isLoading={isLoading}
			/>
		</div>
	);
}

export default withRouter(BrowseWords);

