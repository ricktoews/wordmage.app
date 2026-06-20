import { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate, faRotateLeft, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { getRandomPageData } from '../utils/api';
import WordScroller from './WordScroller';
import Popup from './Popup';
import PopupListShare from './PopupListShare';

const ALBUM_THEMES = ['classic', 'paper', 'ink', 'arcane', 'eldritch', 'obsidian', 'fogbound'];

function getRandomRefreshUndoStorageKey(userId) {
	return `wordmage.randomRefreshUndo.${userId || 'anon'}`;
}

function readRandomRefreshUndoSnapshot(userId) {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		const raw = window.sessionStorage.getItem(getRandomRefreshUndoStorageKey(userId));
		if (!raw) {
			return null;
		}

		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed?.words)) {
			return null;
		}

		return {
			createdAt: parsed.createdAt || Date.now(),
			words: parsed.words,
			featuredWord: parsed.featuredWord || null,
		};
	} catch (error) {
		console.error('Failed to read random refresh undo snapshot:', error);
		return null;
	}
}

function writeRandomRefreshUndoSnapshot(userId, snapshot) {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		if (!snapshot) {
			window.sessionStorage.removeItem(getRandomRefreshUndoStorageKey(userId));
			return;
		}

		window.sessionStorage.setItem(getRandomRefreshUndoStorageKey(userId), JSON.stringify(snapshot));
	} catch (error) {
		console.error('Failed to write random refresh undo snapshot:', error);
	}
}

function Random(props) {
	const [randomWords, setRandomWords] = useState([]);
	const [featuredWord, setFeaturedWord] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [lastRefreshSnapshot, setLastRefreshSnapshot] = useState(null);
	const [showSharePopup, setShowSharePopup] = useState(false);
	const [albumTheme, setAlbumTheme] = useState(() => {
		if (typeof window === 'undefined') {
			return 'classic';
		}

		const savedTheme = window.localStorage.getItem('wordmage.albumTheme');
		return ALBUM_THEMES.includes(savedTheme) ? savedTheme : 'classic';
	});
	const userIdRef = useRef(null);

	useEffect(() => {
		userIdRef.current = localStorage.getItem('wordmage-profile-user_id');
		setLastRefreshSnapshot(readRandomRefreshUndoSnapshot(userIdRef.current));
	}, []);

	useEffect(() => {
		writeRandomRefreshUndoSnapshot(userIdRef.current, lastRefreshSnapshot);
	}, [lastRefreshSnapshot]);

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

	const loadRandomData = async () => {
		setIsLoading(true);
		try {
			const userId = localStorage.getItem('wordmage-profile-user_id');
			userIdRef.current = userId;
			const data = await getRandomPageData(userId);

			setRandomWords(data.words || []);
			setFeaturedWord(data.featured_favorite || null);
			return true;
		} catch (error) {
			console.error('Error loading random page data:', error);
			setRandomWords([]);
			setFeaturedWord(null);
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadRandomData();
	}, []);

	const handleNewRandom = async () => {
		console.log('Refresh random list.');
		const previousSnapshot = {
			words: randomWords,
			featuredWord,
			createdAt: Date.now(),
		};

		const didLoad = await loadRandomData();
		if (didLoad) {
			setLastRefreshSnapshot(previousSnapshot);
		}
	};

	const handleUndoRandomRefresh = () => {
		if (!lastRefreshSnapshot) return;

		setRandomWords(lastRefreshSnapshot.words || []);
		setFeaturedWord(lastRefreshSnapshot.featuredWord || null);
		setLastRefreshSnapshot(null);
	};

	const handleShare = () => {
		setShowSharePopup(true);
	};

	return (
		<div className={`browse-container random-page album-theme-${albumTheme}`}>
			<div className="random-toolbar">
				<div className="random-toolbar-title">Random</div>
				<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
					<button
						type="button"
						className="random-refresh-icon"
						onClick={handleShare}
						title="Share words"
						aria-label="Share words"
						disabled={randomWords.length === 0}
						data-contextual-help="random-share-button"
					>
						<FontAwesomeIcon icon={faShareNodes} />
					</button>
					{lastRefreshSnapshot && (
						<button
							type="button"
							className="random-refresh-icon"
							onClick={handleUndoRandomRefresh}
							title="Undo last refresh"
							aria-label="Undo last refresh"
							disabled={isLoading}
						>
							<FontAwesomeIcon icon={faRotateLeft} />
						</button>
					)}
					<button
						className="random-refresh-icon"
						onClick={handleNewRandom}
						aria-label="Refresh random words"
						disabled={isLoading}
						data-contextual-help="random-refresh-button"
					>
						<FontAwesomeIcon icon={faRotate} spin={isLoading} />
					</button>
				</div>
			</div>

			{featuredWord && (
				<div className="random-featured-card">
					<div className="random-featured-header">
						<div className="random-featured-label">FEATURED FAVORITE WORD</div>
					</div>
					<div className="random-featured-content">
						<div className="word-item-word-container">
							<span className="featured-word-dot">•</span>
							<div className="word-item-word">{featuredWord.word}</div>
						</div>
						<div className="word-item-def-container">
							<div className="word-item-def">{featuredWord.def || featuredWord.definition}</div>
						</div>
					</div>
				</div>
			)}

			{randomWords.length > 0 && (
				<WordScroller pool={randomWords} listType={'random'} popupWordForm={props.popupWordForm} startingNdx={0} onAIExplain={props.onAIExplain} />
			)}

			{isLoading && randomWords.length === 0 && (
				<div className="loading-message">Loading random words...</div>
			)}

			<Popup
				isVisible={showSharePopup}
				handleBackgroundClick={() => setShowSharePopup(false)}
				className={`list-share-popup album-theme-${albumTheme}`}
			>
				<PopupListShare title="Share Random Words" label="Random Words" wordEntries={randomWords} />
			</Popup>
		</div>
	);
}

export default withRouter(Random);
