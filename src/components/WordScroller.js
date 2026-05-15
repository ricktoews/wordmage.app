import { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';
import WordEntry from './WordEntry';
import Popup from './Popup';
import PopupWordShare from './PopupWordShare';
import PopupAlbumSelect from './PopupAlbumSelect';

function WordScroller(props) {
	const scrollerRef = useRef(null);
	const sentinelRef = useRef(null);
	const [showAlbums, setShowAlbums] = useState(false);
	const [showWordShare, setShowWordShare] = useState(false);
	const [shareWord, setShareWord] = useState(null);
	const [albumWordObj, setAlbumWordObj] = useState({});
	const [visibleItems, setVisibleItems] = useState([]);
	const loadedCountRef = useRef(0);
	const visibleCountRef = useRef(0);

	function popupWordShare(wordObj) {
		setShareWord(wordObj);
		setShowWordShare(true);
	}

	function popupAlbums(wordObj) {
		setShowAlbums(true);
		setAlbumWordObj(wordObj);
	}

	function closeAlbumPopup() {
		setShowAlbums(false);
	}

	const handleBackgroundClick = () => {
		setShowWordShare(false);
		setShowAlbums(false);
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
			return updated;
		});
		loadedCountRef.current = currentIndex + newItems.length;
		return true;
	}

	function populateScroller(clearFirst = false) {
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

	function syncVisibleItems(pool) {
		const startingIndex = props.startingNdx || 0;
		const preservedCount = visibleCountRef.current || 15;
		const nextItems = pool
			.slice(startingIndex, startingIndex + preservedCount)
			.map((wordItem, index) => ({
				key: `word-${startingIndex + index}-${wordItem.word || index}`,
				wordItem,
			}));

		setVisibleItems(nextItems);
		loadedCountRef.current = startingIndex + nextItems.length;
	}

	const myObserverCallback = (entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				console.log('Sentinel intersecting, loading more items');
				console.log('hasMore:', props.hasMore, 'isLoading:', props.isLoading, 'onLoadMore:', !!props.onLoadMore);
				// Check if we're in browse mode with API pagination
				if (props.hasMore !== undefined) {
					// API pagination mode
					if (props.hasMore && !props.isLoading && props.onLoadMore) {
						console.log('Calling onLoadMore for API pagination');
						props.onLoadMore();
					} else {
						console.log('Not loading: hasMore =', props.hasMore, 'isLoading =', props.isLoading);
					}
				} else {
					// Local list mode
					loadItems(10);
				}
			}
		});
	};

	useEffect(() => {
		visibleCountRef.current = visibleItems.length;
	}, [visibleItems]);

	useEffect(() => {
		scrollerRef.current.startingNdx = props.startingNdx;
		scrollerRef.current.pool = props.pool;
		// In API pagination mode, don't use local pagination
		if (props.hasMore === undefined) {
			if (visibleCountRef.current > 0) {
				syncVisibleItems(props.pool || []);
			} else {
				populateScroller(true);
			}
		} else {
			// API pagination mode - just display all items from pool
			console.log('API mode: displaying', props.pool.length, 'items, hasMore:', props.hasMore);
			setVisibleItems(props.pool.map((wordItem, index) => ({
				key: `word-${index}-${wordItem.word || index}`,
				wordItem,
			})));
		}
	}, [props.pool, props.startingNdx]);

	useEffect(() => {
		if (!sentinelRef.current) {
			console.error('sentinelRef is not set on mount');
			return;
		}
		const observer = new IntersectionObserver(myObserverCallback, {
			rootMargin: '0px 0px 800px 0px' // Trigger 800px before sentinel enters viewport
		});
		observer.observe(sentinelRef.current);
		console.log('Observer set up, watching sentinel with 800px bottom margin');
		return () => {
			console.log('Disconnecting observer');
			observer.disconnect();
		};
	}, [props.hasMore, props.isLoading, props.onLoadMore]);

	return (
		<div className="word-list-container">
			<Popup isVisible={showWordShare} handleBackgroundClick={handleBackgroundClick}>
				<PopupWordShare shareWord={shareWord} wordId={142} />
			</Popup>
			<Popup isVisible={showAlbums} handleBackgroundClick={handleBackgroundClick}>
				<PopupAlbumSelect
					showAlbums={showAlbums}
					wordObj={albumWordObj}
					listType={props.listType}
					closeAlbumPopup={closeAlbumPopup}
				/>
			</Popup>

			<div
				className="word-list-scroller"
				ref={scrollerRef}
			>
				{visibleItems.map(({ key, wordItem }) => (
					<div key={key} className="word-item-container">
						<WordEntry
						popupAlbums={popupAlbums} popupWordShare={popupWordShare}
						wordObj={wordItem}
						listType={props.listType}
						albumId={props.albumId} hasMoodText={props.hasMoodText} onWordLockToggle={props.onWordLockToggle} onAlbumRefresh={props.onAlbumRefresh}
						history={props.history}
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