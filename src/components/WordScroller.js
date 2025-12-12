import { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';
import WordEntry from './WordEntry';
import Popup from './Popup';
import PopupTagList from './PopupTagList';
import PopupWordShare from './PopupWordShare';

function WordScroller(props) {
	const scrollerRef = useRef(null);
	const sentinelRef = useRef(null);
	const [showTags, setShowTags] = useState(false);
	const [showWordShare, setShowWordShare] = useState(false);
	const [shareWord, setShareWord] = useState(null);
	const [tagWordObj, setTagWordObj] = useState({});
	const [tagList, setTagList] = useState(WordsInterface.getTagList());
	const [tagToggle, setTagToggle] = useState(null);
	const [visibleItems, setVisibleItems] = useState([]);
	const loadedCountRef = useRef(0);

	const taggedOnClass = 'badge-tag-filter-on';
	const taggedOffClass = 'badge-tag-filter-off';

	function tagWord(wordObj, tag, add, closeTagList) {
		if (!Array.isArray(wordObj.tags)) {
			wordObj.tags = [];
		}
		if (tag) {
			let ndx = wordObj.tags.indexOf(tag);
			if (add) {
				if (ndx === -1) {
					wordObj.tags.push(tag);
					tagToggle.classList.remove(taggedOffClass);
					tagToggle.classList.add(taggedOnClass);
				}
			} else {
				wordObj.tags.splice(ndx, 1);
				if (wordObj.tags.length === 0) {
					tagToggle.classList.remove(taggedOnClass);
					tagToggle.classList.add(taggedOffClass);
				}
			}
		}
		WordsInterface.updateTags(wordObj.word, wordObj.tags);
		if (closeTagList) {
			setShowTags(false);
			setTagList(WordsInterface.getTagList());
		}
	}

	function closeTagPopup() {
		setShowTags(false);
	}

	function popupTags(wordObj, tagButtonEl) {
		setShowTags(true);
		setTagWordObj(wordObj);
		setTagToggle(tagButtonEl);
	}

	function popupWordShare(wordObj) {
		setShareWord(wordObj);
		setShowWordShare(true);
	}

	const handleBackgroundClick = () => {
		setShowWordShare(false);
		setShowTags(false);
	};

	function loadItems(quant, append = true) {
		const pool = props.pool || [];
		const currentIndex = append ? loadedCountRef.current : props.startingNdx || 0;
		if (currentIndex >= pool.length) {
			console.log('No more items to load - pool exhausted');
			return false;
		}
		const newItems = pool
			.slice(currentIndex, currentIndex + quant)
			.map((wordItem, index) => ({
				key: `word-${currentIndex + index}-${wordItem.word || index}`,
				wordItem,
			}));
		if (newItems.length === 0) {
			console.log('No new items added - empty slice');
			return false;
		}
		setVisibleItems((prev) => {
			const updated = append ? [...prev, ...newItems] : newItems;
			//console.log('Set visibleItems:', updated.map((item) => item.wordItem.word));
			return updated;
		});
		loadedCountRef.current = currentIndex + newItems.length;
		//console.log('Updated loadedCountRef:', loadedCountRef.current);
		return true;
	}

	function populateScroller(clearFirst = false) {
		//console.log('populateScroller:', { clearFirst, poolLength: props.pool?.length });
		if (clearFirst) {
			setVisibleItems([]);
			loadedCountRef.current = props.startingNdx || 0;
			loadItems(15, false);
		} else {
			loadItems(10);
			scrollerRef.current.appendChild(sentinelRef.current);
			loadItems(10);
		}
	}

	const myObserverCallback = (entries) => {
		//console.log('myObserverCallback visibleItems:', visibleItems.map((item) => item.wordItem.word));
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				console.log('Sentinel intersecting, loading more items');
				loadItems(10);
			}
		});
	};

	useEffect(() => {
		scrollerRef.current.startingNdx = props.startingNdx;
		scrollerRef.current.pool = props.pool;
		populateScroller(true);
	}, [props.pool, props.startingNdx]);

	useEffect(() => {
		if (!sentinelRef.current) {
			console.error('sentinelRef is not set on mount');
			return;
		}
		const observer = new IntersectionObserver(myObserverCallback);
		//console.log('Setting up observer for sentinel:', sentinelRef.current);
		observer.observe(sentinelRef.current);
		return () => {
			console.log('Disconnecting observer');
			observer.disconnect();
		};
	}, []);

	const tagListEl = (ref) => {
		if (ref.current) {
			const el = ref.current;
			const classes = Array.from(el.classList);
			const isPopupActive = !classes.includes('element-hide');
			if (isPopupActive) {
				console.log('Should hide popup');
			}
		}
	};

	return (
		<div className="word-list-container">
			<Popup isVisible={showWordShare} handleBackgroundClick={handleBackgroundClick}>
				<PopupWordShare shareWord={shareWord} wordId={142} />
			</Popup>
			<Popup isVisible={showTags} handleBackgroundClick={handleBackgroundClick}>
				<PopupTagList
					showTags={showTags}
					tagListEl={tagListEl}
					tagList={tagList}
					wordObj={tagWordObj}
					closeTagPopup={closeTagPopup}
					tagWord={tagWord}
				/>
			</Popup>

			<div
				className="word-list-scroller"
				ref={scrollerRef}
			>
				{visibleItems.map(({ key, wordItem }) => (
				<div key={key} className="word-item-container">
					<WordEntry
						popupTags={popupTags}
						popupWordShare={popupWordShare}
						wordObj={wordItem}
						listType={props.listType}
						history={props.history}
						popupWordForm={props.popupWordForm}
						onAIExplain={props.onAIExplain}
					/>
				</div>
				))}
				<div
					id="sentinel"
					ref={sentinelRef}
					style={{ height: '20px', background: 'transparent' }}
				/>
			</div>
		</div>
	);
}

export default withRouter(WordScroller);