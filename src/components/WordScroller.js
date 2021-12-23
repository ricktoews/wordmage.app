import ReactDOM from 'react-dom';
import { useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';
import WordEntry from './WordEntry';

function WordScroller(props) {
	const { history } = props;
	const scrollerRef = useRef(null);
	const sentinelRef = useRef(null);

	function loadItems(quant) {
		let counter = scrollerRef.current.startingNdx || 0;
		for (let i = 0; i < quant && counter < scrollerRef.current.pool.length; i++) {
			let wordItem = scrollerRef.current.pool[counter++];
			let item = document.createElement('div');
			item.classList.add('word-item-container');
			ReactDOM.render(<WordEntry wordObj={wordItem} listType={props.listType} history={props.history} />, item);
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

export default withRouter(WordScroller);
