import ReactDOM from 'react-dom';
import { useEffect, useState, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom } from '@fortawesome/free-solid-svg-icons';
import { WordMageContext } from '../WordMageContext';
import WordScroller from './WordScroller';
import WordsInterface from '../utils/words-interface';
import { getWordsPage } from '../utils/api';
import Popup from './Popup';

const INFINITE_SCROLLING_ON = 'list-loading-container';
const INFINITE_SCROLLING_OFF = 'hide-section';
const listLength = 20;
const listIncrement = 30;
const ALBUM_THEMES = ['classic', 'paper', 'ink', 'arcane', 'eldritch', 'obsidian', 'fogbound'];


function BrowseWords(props) {
	const { contextValue, setContextValue } = useContext(WordMageContext);

	const [wordObjList, setWordObjList] = useState([]);
	const [startingLetters, setStartingLetters] = useState(props.match.params.start || 'a');
	const [hasMore, setHasMore] = useState(true);
	const [nextCursor, setNextCursor] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [browseMode, setBrowseMode] = useState('api');
	const [albumTheme, setAlbumTheme] = useState(() => {
		if (typeof window === 'undefined') {
			return 'classic';
		}

		const savedTheme = window.localStorage.getItem('wordmage.albumTheme');
		return ALBUM_THEMES.includes(savedTheme) ? savedTheme : 'classic';
	});

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
		// placeholder - was checking showTags
	}, [contextValue]);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return undefined;
		}

		const syncAlbumTheme = (themeOverride) => {
			const storedTheme = themeOverride || window.localStorage.getItem('wordmage.albumTheme');
			setAlbumTheme(ALBUM_THEMES.includes(storedTheme) ? storedTheme : 'classic');
		};

		const handleAlbumThemeChanged = (event) => {
			syncAlbumTheme(event?.detail?.theme);
		};

		const handleStorage = (event) => {
			if (event.key === 'wordmage.albumTheme') {
				syncAlbumTheme();
			}
		};

		window.addEventListener('wordmage:albumThemeChanged', handleAlbumThemeChanged);
		window.addEventListener('storage', handleStorage);

		return () => {
			window.removeEventListener('wordmage:albumThemeChanged', handleAlbumThemeChanged);
			window.removeEventListener('storage', handleStorage);
		};
	}, []);

	// Load initial page when component mounts or starting letters change
	useEffect(() => {
		if (browseMode === 'api') {
			loadInitialPage(startingLetters);
		}
	}, [startingLetters, browseMode]);

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
			setStartingLetters(partial);
			props.history.push('/browse/' + partial);
			el.blur();
		}, 2500);
	};

	const handleRandomJump = () => {
		// Generate a random 5-letter string
		const letters = 'abcdefghijklmnopqrstuvwxyz';
		let randomString = '';
		for (let i = 0; i < 5; i++) {
			randomString += letters.charAt(Math.floor(Math.random() * letters.length));
		}

		window.scrollTo(0, 0);
		setBrowseMode('api');
		setStartingLetters(randomString);
		props.history.push('/browse/' + randomString);
	}

	return (
		<div className={`browse-container browse-page album-theme-${albumTheme}`}>
			<div className="browse-toolbar">
				<div className="browse-toolbar-title">Browse</div>
				<div className="browse-toolbar-search">
					<input type="text" autoCapitalize="off" className="partial-word" onChange={handlePartialWord} placeholder="Jump to" />
				</div>
				<div className="browse-filter-buttons">
					<button className="badge badge-random-jump" onClick={handleRandomJump} title="Jump to a random location">
						<FontAwesomeIcon icon={faRandom} />
					</button>
				</div>

			</div>
			<WordScroller
				pool={wordObjList}
				startingNdx={0}
				listType={'browse'}
				onAIExplain={props.onAIExplain}
				hasMore={hasMore}
				onLoadMore={loadMoreWords}
				isLoading={isLoading}
			/>
		</div>
	);
}

export default withRouter(BrowseWords);
