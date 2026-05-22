import { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate, faRotateLeft, faPalette, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { getRandomPageData } from '../utils/api';
import WordScroller from './WordScroller';
import Popup from './Popup';
import PopupListShare from './PopupListShare';

const ALBUM_THEMES = ['classic', 'paper', 'ink', 'arcane', 'eldritch', 'obsidian', 'fogbound'];
const ALBUM_THEME_LABELS = {
	classic: 'Literary',
	paper: 'Parchment',
	ink: 'Nocturne',
	arcane: 'Arcane',
	eldritch: 'Eldritch',
	obsidian: 'Obsidian',
	fogbound: 'Fogbound'
};

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
	const [showThemeMenu, setShowThemeMenu] = useState(false);
	const [showSharePopup, setShowSharePopup] = useState(false);
	const [albumTheme, setAlbumTheme] = useState(() => {
		if (typeof window === 'undefined') {
			return 'classic';
		}

		const savedTheme = window.localStorage.getItem('wordmage.albumTheme');
		return ALBUM_THEMES.includes(savedTheme) ? savedTheme : 'classic';
	});
	const themeMenuRef = useRef(null);
	const themeToggleButtonRef = useRef(null);
	const themeClickTimerRef = useRef(null);
	const lastThemeToggleClickRef = useRef(0);
	const userIdRef = useRef(null);

	const THEME_DOUBLE_TAP_MS = 280;

	useEffect(() => {
		userIdRef.current = localStorage.getItem('wordmage-profile-user_id');
		setLastRefreshSnapshot(readRandomRefreshUndoSnapshot(userIdRef.current));
	}, []);

	useEffect(() => {
		writeRandomRefreshUndoSnapshot(userIdRef.current, lastRefreshSnapshot);
	}, [lastRefreshSnapshot]);

	useEffect(() => {
		window.localStorage.setItem('wordmage.albumTheme', albumTheme);

		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('wordmage:albumThemeChanged', {
				detail: { theme: albumTheme }
			}));
		}
	}, [albumTheme]);

	useEffect(() => {
		if (!showThemeMenu) {
			return undefined;
		}

		const handleOutsideThemeMenuClick = (event) => {
			const target = event.target;

			if (themeMenuRef.current?.contains(target) || themeToggleButtonRef.current?.contains(target)) {
				return;
			}

			setShowThemeMenu(false);
		};

		const handleEscape = (event) => {
			if (event.key === 'Escape') {
				setShowThemeMenu(false);
			}
		};

		document.addEventListener('mousedown', handleOutsideThemeMenuClick);
		document.addEventListener('touchstart', handleOutsideThemeMenuClick, { passive: true });
		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('mousedown', handleOutsideThemeMenuClick);
			document.removeEventListener('touchstart', handleOutsideThemeMenuClick);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [showThemeMenu]);

	useEffect(() => {
		return () => {
			if (themeClickTimerRef.current) {
				clearTimeout(themeClickTimerRef.current);
			}
		};
	}, []);

	const cycleAlbumTheme = () => {
		setAlbumTheme((currentTheme) => {
			const currentIndex = ALBUM_THEMES.indexOf(currentTheme);
			const nextIndex = (currentIndex + 1) % ALBUM_THEMES.length;
			return ALBUM_THEMES[nextIndex];
		});
	};

	const handleThemeToggleClick = () => {
		const now = Date.now();
		const msSinceLastClick = now - lastThemeToggleClickRef.current;

		if (msSinceLastClick > 0 && msSinceLastClick <= THEME_DOUBLE_TAP_MS) {
			if (themeClickTimerRef.current) {
				clearTimeout(themeClickTimerRef.current);
				themeClickTimerRef.current = null;
			}
			lastThemeToggleClickRef.current = 0;
			setShowThemeMenu((prev) => !prev);
			return;
		}

		lastThemeToggleClickRef.current = now;
		if (themeClickTimerRef.current) {
			clearTimeout(themeClickTimerRef.current);
		}

		themeClickTimerRef.current = setTimeout(() => {
			cycleAlbumTheme();
			themeClickTimerRef.current = null;
		}, THEME_DOUBLE_TAP_MS);
	};

	const handleThemeSelect = (theme) => {
		setAlbumTheme(theme);
		setShowThemeMenu(false);
	};

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
					<div className="album-theme-menu-container">
						<button
							ref={themeToggleButtonRef}
							className="random-refresh-icon album-theme-toggle"
							onClick={handleThemeToggleClick}
							title={`Theme: ${ALBUM_THEME_LABELS[albumTheme]}. Click to cycle, double-click or double-tap for Themes menu.`}
							aria-label={`Theme: ${ALBUM_THEME_LABELS[albumTheme]}. Click to cycle, double-click or double-tap for Themes menu.`}
							aria-haspopup="menu"
							aria-expanded={showThemeMenu}
						>
							<FontAwesomeIcon icon={faPalette} />
						</button>
						{showThemeMenu && (
							<div className="album-theme-menu" ref={themeMenuRef} role="menu" aria-label="Themes">
								<div className="album-theme-menu-title">Themes</div>
								{ALBUM_THEMES.map((theme) => (
									<button
										key={theme}
										type="button"
										className={`album-theme-menu-item${theme === albumTheme ? ' active' : ''}`}
										onClick={() => handleThemeSelect(theme)}
										role="menuitemradio"
										aria-checked={theme === albumTheme}
									>
										<span className="album-theme-menu-item-name">{ALBUM_THEME_LABELS[theme]}</span>
										<span className="album-theme-menu-item-status">{theme === albumTheme ? 'Current' : ''}</span>
									</button>
								))}
							</div>
						)}
					</div>
					<button
						type="button"
						className="random-refresh-icon"
						onClick={handleShare}
						title="Share words"
						aria-label="Share words"
						disabled={randomWords.length === 0}
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
					<button className="random-refresh-icon" onClick={handleNewRandom} aria-label="Refresh random words" disabled={isLoading}>
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

			<Popup isVisible={showSharePopup} handleBackgroundClick={() => setShowSharePopup(false)}>
				<PopupListShare title="Share Random Words" label="Random Words" wordEntries={randomWords} />
			</Popup>
		</div>
	);
}

export default withRouter(Random);
