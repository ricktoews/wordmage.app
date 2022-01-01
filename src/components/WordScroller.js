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
	const [tagList, setTagList] = useState(getTagList());

	function getTagList() {
		var wordObjList = WordsInterface.fullWordList();
		var taggedWords = wordObjList.filter(item => item.tags && Array.isArray(item.tags));
		var tags = taggedWords.map(item => item.tags);
		tags = [].concat(...tags);
		tags = Array.from(new Set(tags));
		return tags;
	}

	function tagWord(wordObj, tag, add, closeTagList) {
		if (Array.isArray(wordObj.tags) === false) { wordObj.tags = []; }
		if (tag) {
			let ndx = wordObj.tags.indexOf(tag);
			if (add) {
				if (ndx === -1) {
					wordObj.tags.push(tag);
				}
			}
			else {
				wordObj.tags.splice(ndx, 1);
			}
		}
		WordsInterface.updateTags(wordObj.word, wordObj.tags);
		if (closeTagList) {
			setShowTags(false);
			setTagList(getTagList());
		}
	}

	function popupTags(wordObj) {
		setShowTags(true);
		setTagWordObj(wordObj);
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

	return (
	  <div className="word-list-container">
	    <TagList showTags={showTags} tagList={tagList} wordObj={tagWordObj} tagWord={tagWord} />
	    <div className="word-list-scroller" ref={scrollerRef}>
	      <div id="sentinel" ref={sentinelRef}></div>
	    </div>
	  </div>
	);
}

export default withRouter(WordScroller);
