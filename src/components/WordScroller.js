import ReactDOM from 'react-dom';
import { useEffect, useRef } from 'react';
import WordsInterface from '../utils/words-interface';

const likeOffClass = 'badge-like-filter-off';
const likeOnClass = 'badge-like-filter-on';
const dislikeOffClass = 'badge-dislike-filter-off';
const dislikeOnClass = 'badge-dislike-filter-on';
const learnOffClass = 'badge-learn-filter-off';
const learnOnClass = 'badge-learn-filter-on';

function toggleClass(el, toggleClasses) {
	let classes = Array.from(el.classList);
	if (classes.indexOf(toggleClasses[0]) !== -1) {
		el.classList.remove(toggleClasses[0])
		el.classList.add(toggleClasses[1])
	}
	else {
		el.classList.remove(toggleClasses[1])
		el.classList.add(toggleClasses[0])
	}
}

function thumbsUpHandler(e) {
	var el = e.target;
	if (!el.dataset.word) {
		el = el.parentNode;
	}
	var data = el.dataset;
	var {liked, word} = data;
	toggleClass(el, [likeOnClass, likeOffClass]);
	WordsInterface.toggleSpotlight(word);
}

function learnHandler(e) {
	var el = e.target;
	if (!el.dataset.word) {
		el = el.parentNode;
	}
	var data = el.dataset;
	var {learn, word} = data;
	toggleClass(el, [learnOnClass, learnOffClass]);
	WordsInterface.toggleLearn(word);
}

function thumbsDownHandler(e) {
	var el = e.target;
	if (!el.dataset.word) {
		el = el.parentNode;
	}
	var data = el.dataset;
	var {disliked, word} = data;
	toggleClass(el, [dislikeOnClass, dislikeOffClass]);
	WordsInterface.toggleDislike(word);
}

function makeButtonSet(wordObj, listType) {
	var buttons;
	var learnClass = wordObj.learn ? learnOnClass : learnOffClass;
	var likeClass = wordObj.spotlight ? likeOnClass : likeOffClass;
	var dislikeClass = wordObj.dislike ? dislikeOnClass : dislikeOffClass;
	switch (listType) {
		case 'liked':
			buttons = (<div className="word-item-buttons">
                <button className={'badge ' + learnClass} data-liked={wordObj.learn} data-word={wordObj.word} onClick={learnHandler}><i className="glyphicon glyphicon-leaf"></i> &nbsp;Learn</button>
                <button className={'badge ' + likeOnClass} data-liked={wordObj.spotlight} data-word={wordObj.word} onClick={thumbsUpHandler}><i className="glyphicon glyphicon-thumbs-up"></i> &nbsp;Like</button>
              </div>);
			break;
		case 'learn':
			buttons = (<div className="word-item-buttons">
                <button className={'badge ' + learnClass} data-liked={wordObj.learn} data-word={wordObj.word} onClick={learnHandler}><i className="glyphicon glyphicon-leaf"></i> &nbsp;Learn</button>
                <button className={'badge ' + likeClass} data-liked={wordObj.spotlight} data-word={wordObj.word} onClick={thumbsUpHandler}><i className="glyphicon glyphicon-thumbs-up"></i> &nbsp;Like</button>
                <button className={'badge ' + dislikeClass} data-disliked={wordObj.dislike} data-word={wordObj.word} onClick={thumbsDownHandler}><i className="glyphicon glyphicon-thumbs-down"></i> &nbsp;Meh</button>
              </div>);
			break;
		default:
			buttons = (<div className="word-item-buttons">
                <button className={'badge ' + learnClass} data-liked={wordObj.learn} data-word={wordObj.word} onClick={learnHandler}><i className="glyphicon glyphicon-leaf"></i> &nbsp;Learn</button>
                <button className={'badge ' + likeClass} data-liked={wordObj.spotlight} data-word={wordObj.word} onClick={thumbsUpHandler}><i className="glyphicon glyphicon-thumbs-up"></i> &nbsp;Like</button>
                <button className={'badge ' + dislikeClass} data-disliked={wordObj.dislike} data-word={wordObj.word} onClick={thumbsDownHandler}><i className="glyphicon glyphicon-thumbs-down"></i> &nbsp;Meh</button>
              </div>);
	}
		
	return buttons;
}

function deleteWord(wordObj) {
	WordsInterface.deleteCustomWord(wordObj._id);
}

function makeWordEntry(wordObj, listtype) {
	console.log('makeWordEntry', wordObj);
	var buttons = makeButtonSet(wordObj, listtype);
	return wordObj.divider ? <hr className="rejects" /> : (
	  <div className="word-item">
	    <div className="word-item-word-container">
	      <div className="word-item-word">{wordObj.word}</div>
		{ wordObj.myown ? <div className="trash-btn" onClick={() => { deleteWord(wordObj); }}><i className="glyphicon glyphicon-trash"></i>&nbsp;</div> : null }
	    </div>
	    <div className="word-item-def">
              {wordObj.def}
	      {buttons}
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
