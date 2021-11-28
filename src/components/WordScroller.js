import ReactDOM from 'react-dom';
import { useEffect, useRef } from 'react';
import WordsInterface from '../utils/words-interface';

const spotlightFilterClass = 'badge-spotlight-filter';
const likeOffClass = 'badge-spotlight-filter-off';
const likeOnClass = 'badge-spotlight-filter-on';

function thumbsUpHandler(e) {
	var el = e.target;
	if (!el.dataset.word) {
		el = el.parentNode;
	}
	var data = el.dataset;
	var {liked, word} = data;
	WordsInterface.toggleSpotlight(word);
}

function makeButtonSet(wordObj, listType) {
	var buttons;
	if (listType === 'liked') {
              buttons = (<div className="word-item-buttons">
                <button className={'badge ' + likeOnClass} data-liked={wordObj.spotlight} data-word={wordObj.word} onClick={thumbsUpHandler}><i className="glyphicon glyphicon-thumbs-up"></i> &nbsp; Like</button>
              </div>);
	}
	else {
              buttons = (<div className="word-item-buttons">
                <button className={'badge ' + spotlightFilterClass} data-liked={wordObj.spotlight} data-word={wordObj.word} onClick={thumbsUpHandler}><i className="glyphicon glyphicon-thumbs-up"></i> &nbsp; Like</button>
                <button className={'badge ' + spotlightFilterClass}><i className="glyphicon glyphicon-thumbs-down"></i> &nbsp; Meh</button>
              </div>);
	}
		
	return buttons;
}

function makeWordEntry(wordObj, listtype) {
	var buttons = makeButtonSet(wordObj, listtype);
	return (
	  <div className="word-item">
	    <div className="word-item-word-container">
	      <div className="word-item-word">{wordObj.word}</div>
	    </div>
	    <div className="word-item-def">
	      {buttons}
              {wordObj.def}
            </div>
	  </div>
	);
}

function WordScroller(props) {
	const scrollerRef = useRef(null);
	const sentinelRef = useRef(null);

	function loadItems(quant) {
		let counter = scrollerRef.current.startingNdx || 0;
		for (let i = 0; i < quant && counter < scrollerRef.current.pool.length; i++) {
			let wordItem = scrollerRef.current.pool[counter++];
			let item = document.createElement('div');
			item.classList.add('word-item-container');
			var wordEl = makeWordEntry(wordItem, props.listtype);
			ReactDOM.render(wordEl, item);
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
	    <div className="word-list-scroller" ref={scrollerRef}>
	      <div id="sentinel" ref={sentinelRef}></div>
	    </div>
	  </div>
	);
}

export default WordScroller;
