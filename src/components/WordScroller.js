import ReactDOM from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';
import WordEntry from './WordEntry';
import TagList from './TagList';

function WordScroller(props) {
	const { history } = props;
	const scrollerRef = useRef(null);
	const sentinelRef = useRef(null);
	const [showTags, setShowTags] = useState(false);
	const [tagWordObj, setTagWordObj] = useState({});
	const [tagList, setTagList] = useState(WordsInterface.getTagList());
	const [tagToggle, setTagToggle] = useState(null);

	const taggedOnClass = 'badge-tag-filter-on';
	const taggedOffClass = 'badge-tag-filter-off';

	function tagWord(wordObj, tag, add, closeTagList) {
		if (Array.isArray(wordObj.tags) === false) { wordObj.tags = []; }
		if (tag) {
			let ndx = wordObj.tags.indexOf(tag);
			if (add) {
				if (ndx === -1) {
					wordObj.tags.push(tag);
					// highlight Tag button
					tagToggle.classList.remove(taggedOffClass);
					tagToggle.classList.add(taggedOnClass);
				}
			}
			else {
				wordObj.tags.splice(ndx, 1);
				// unhighlight Tag button
				console.log('wordObj.tags', wordObj.tags);
				if (wordObj.tags.length === 0) {
					tagToggle.classList.remove(taggedOnClass);
					tagToggle.classList.add(taggedOffClass);
				}
			}
		}
		WordsInterface.updateTags(wordObj.word, wordObj.tags);
		if (closeTagList) {
			setShowTags(false);
			console.log('getTagList', WordsInterface.getTagList());
			setTagList(WordsInterface.getTagList());
		}
	}

	function closeTagPopup() {
		setShowTags(false);
	}

	function popupTags(wordObj, tagButtonEl) {
		//console.log('popupTags', wordObj, tagButtonEl);
		setShowTags(true);
		setTagWordObj(wordObj);
		setTagToggle(tagButtonEl);
	}

	function loadItems(quant) {
		let counter = scrollerRef.current.startingNdx || 0;
		for (let i = 0; i < quant && counter < scrollerRef.current.pool.length; i++) {
			let wordItem = scrollerRef.current.pool[counter++];
			let item = document.createElement('div');
			item.classList.add('word-item-container');
			ReactDOM.render(<WordEntry popupTags={popupTags} wordObj={wordItem} listType={props.listType} history={props.history} popupWordForm={props.popupWordForm} />, item);
			scrollerRef.current.appendChild(item);
		}
		scrollerRef.current.startingNdx = counter;
	}

	function populateScroller(clearFirst = false) {
		if (clearFirst) {
			while (scrollerRef.current.firstChild) {
				scrollerRef.current.removeChild(scrollerRef.current.firstChild);
			}
		}
		loadItems(10);
		scrollerRef.current.appendChild(sentinelRef.current);
		loadItems(5);
	}

	const myObserverCallback = (entries) => {
		if (entries.some(entry => entry.isIntersecting)) {
			populateScroller();
		}
	};

	useEffect(() => {
		scrollerRef.current.startingNdx = props.startingNdx;
		scrollerRef.current.pool = props.pool;
		populateScroller(true);
	}, [props.pool]);

	useEffect(() => {
		scrollerRef.current.startingNdx = props.startingNdx;
		scrollerRef.current.pool = props.pool;
		populateScroller(true);
	}, [props.startingNdx]);

	useEffect(() => {
		var intersectionObserver = new IntersectionObserver(myObserverCallback);
		intersectionObserver.observe(sentinelRef.current);

		return () => { console.log('disconnect observer'); intersectionObserver.disconnect(); }
	}, []);

	const tagListEl = ref => {
		console.log('WordScroller, tagListEl', ref);
		let el = ref.current;
		let classes = Array.from(el.classList);
		let isPopupActive = classes.indexOf('element-hide') === -1;
		if (isPopupActive) {
			console.log('Should hide popup');
		}

	}

	return (
	  <div className="word-list-container">
	    <TagList showTags={showTags} tagListEl={tagListEl} tagList={tagList} wordObj={tagWordObj} closeTagPopup={closeTagPopup} tagWord={tagWord} />
	    <div className="word-list-scroller" ref={scrollerRef}>
	      <div id="sentinel" ref={sentinelRef}></div>
	    </div>
	  </div>
	);
}

export default withRouter(WordScroller);
