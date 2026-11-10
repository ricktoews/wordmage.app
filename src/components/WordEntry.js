import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PopupWordPrompt from './PopupWordPrompt';
import SparklesIcon from './icons/SparklesIcon';
import FavoriteThumb from './icons/FavoriteThumb';
import { CONFIG } from '../config';
import { authFetch } from '../utils/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import WordsInterface from '../utils/words-interface';
import WordCardMenu from './WordCardMenu';
import { FacebookShareButton, FacebookIcon } from "react-share";
import { TwitterShareButton, XIcon } from "react-share";

function WordEntry(props) {
	const { history } = props;
	const { wordObj, listType, readOnly = false } = props;
	const [updateToggle, setUpdateToggle] = useState(false);
	const [showPrompt, setShowPrompt] = useState(false);
	const [favoritePending, setFavoritePending] = useState(false);
	const favoriteRequest = useRef(false);
	const askAIButtonRef = useRef(null);
	const [historySettings, setHistorySettings] = useState(() => WordsInterface.getHistoryScoringSettings());
	const wordItemRef = useRef(null);
	const viewport3sTimerRef = useRef(null);
	const viewport6sTimerRef = useRef(null);
	const scrollStopTimerRef = useRef(null);
	const isFullyVisibleRef = useRef(false);

	const formatHistoryTimestamp = (timestamp) => {
		if (!timestamp) {
			return null;
		}

		const date = new Date(timestamp);
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const viewedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const dayDiff = Math.round((today - viewedDay) / (1000 * 60 * 60 * 24));

		if (dayDiff === 0) {
			return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
		}

		if (dayDiff === 1) {
			return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
		}

		return date.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	};

	const metadataSummary = listType === 'history'
		? formatHistoryTimestamp(wordObj.lastViewedAt)
		: null;

	// Check if word is in favorites list (liked array)
	const isFavorited = WordsInterface.isWordLiked(wordObj.word);

	useEffect(() => {
		const syncFavorite = event => {
			if (!event.detail?.word || event.detail.word === wordObj.word) {
				setUpdateToggle(value => !value);
			}
		};
		window.addEventListener('wordmage:favoritesChanged', syncFavorite);
		return () => window.removeEventListener('wordmage:favoritesChanged', syncFavorite);
	}, [wordObj.word]);

	const handleFavoriteToggle = async event => {
		event.stopPropagation();
		if (readOnly || listType === 'inbox' || favoriteRequest.current) return;
		favoriteRequest.current = true;
		setFavoritePending(true);
		try {
			const albumId = WordsInterface.getAlbumIds().Favorites;
			if (!albumId) throw new Error('Favorites album not configured. Please try again.');
			const adding = !WordsInterface.isWordLiked(wordObj.word);
			const response = await authFetch(`${CONFIG.domain}/albums/${adding ? 'add-word' : 'delete-word'}`, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ album_id: albumId, word_id: wordObj.id })
			});
			if (!response.ok) throw new Error('Unable to update Favorites. Please try again.');
			if (adding) {
				WordsInterface.addToLiked(wordObj);
				WordsInterface.recordWordInterestSignal(wordObj, 'favorite_or_album', listType);
			} else {
				WordsInterface.removeFromLiked(wordObj);
			}
			setUpdateToggle(value => !value);
			props.onAlbumRefresh?.();
		} catch (error) {
			window.alert(error.message || 'Unable to update Favorites. Please try again.');
		} finally {
			favoriteRequest.current = false;
			setFavoritePending(false);
		}
	};

	useEffect(() => {
		const syncHistorySettings = () => {
			setHistorySettings(WordsInterface.getHistoryScoringSettings());
		};

		const handleStorage = (event) => {
			if (event.key === 'wordmage.historyScoringSettings') {
				syncHistorySettings();
			}
		};

		window.addEventListener('wordmage:historyScoringChanged', syncHistorySettings);
		window.addEventListener('storage', handleStorage);

		return () => {
			window.removeEventListener('wordmage:historyScoringChanged', syncHistorySettings);
			window.removeEventListener('storage', handleStorage);
		};
	}, []);

	// Weighted viewport signals: +1 at 3s, +1 at 6s when fully visible.
	useEffect(() => {
		if (readOnly) return;
		if (wordObj.divider) return;

		const clearViewportTimers = () => {
			if (viewport3sTimerRef.current) {
				clearTimeout(viewport3sTimerRef.current);
				viewport3sTimerRef.current = null;
			}
			if (viewport6sTimerRef.current) {
				clearTimeout(viewport6sTimerRef.current);
				viewport6sTimerRef.current = null;
			}
		};

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						isFullyVisibleRef.current = true;

						if (!viewport3sTimerRef.current) {
							viewport3sTimerRef.current = setTimeout(() => {
								WordsInterface.recordWordInterestSignal(wordObj, 'viewport_3s', listType);
								viewport3sTimerRef.current = null;
							}, historySettings.viewport3sMs);
						}

						if (!viewport6sTimerRef.current) {
							viewport6sTimerRef.current = setTimeout(() => {
								WordsInterface.recordWordInterestSignal(wordObj, 'viewport_6s', listType);
								viewport6sTimerRef.current = null;
							}, historySettings.viewport6sMs);
						}
					} else {
						isFullyVisibleRef.current = false;
						clearViewportTimers();
					}
				});
			},
			{ threshold: 1 }
		);

		if (wordItemRef.current) {
			observer.observe(wordItemRef.current);
		}

		return () => {
			isFullyVisibleRef.current = false;
			clearViewportTimers();
			observer.disconnect();
			if (scrollStopTimerRef.current) {
				clearTimeout(scrollStopTimerRef.current);
				scrollStopTimerRef.current = null;
			}
		};
	}, [wordObj, listType, historySettings.viewport3sMs, historySettings.viewport6sMs, readOnly]);

	// Scroll-stop signal while card is fully visible.
	useEffect(() => {
		if (readOnly) return;
		if (wordObj.divider) return;

		const handleScroll = () => {
			if (!isFullyVisibleRef.current) return;

			if (scrollStopTimerRef.current) {
				clearTimeout(scrollStopTimerRef.current);
			}

			scrollStopTimerRef.current = setTimeout(() => {
				if (isFullyVisibleRef.current) {
					WordsInterface.recordWordInterestSignal(wordObj, 'scroll_stop_visible', listType);
				}
				scrollStopTimerRef.current = null;
			}, historySettings.scrollStopVisibleMs);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (scrollStopTimerRef.current) {
				clearTimeout(scrollStopTimerRef.current);
				scrollStopTimerRef.current = null;
			}
		};
	}, [wordObj, listType, historySettings.scrollStopVisibleMs, readOnly]);

	function scrambleWord(wordObj) {
		console.log('scrambleWord', wordObj);
		history.push('/unscramble', { wordObj: wordObj });
	}

	const handleCardTap = event => {
		if (event.target.closest('input, label, button, a')) return;
		if (readOnly) return;
		if (props.onSelectionToggle) {
			props.onSelectionToggle();
			return;
		}
		WordsInterface.recordWordInterestSignal(wordObj, 'tap_card', listType);
	};

	return wordObj.divider ? <hr className="rejects" /> : (
		<div className={`word-item${listType !== 'inbox' ? ' word-item-compact-actions' : ''}${props.selected ? ' word-item-selected' : ''}`} ref={wordItemRef} onClick={handleCardTap}>
			<div className="word-content-wrapper">
				<div className="word-item-word-container">
					<div className="word-edit-btn">

					</div>
					{listType !== 'inbox' && !readOnly && <button type="button" className="word-favorite-toggle"
						aria-label={`${isFavorited ? 'Remove' : 'Add'} ${wordObj.word} ${isFavorited ? 'from' : 'to'} Favorites`}
						title={`${isFavorited ? 'Remove' : 'Add'} ${wordObj.word} ${isFavorited ? 'from' : 'to'} Favorites`}
						aria-pressed={isFavorited} aria-busy={favoritePending} disabled={favoritePending} onClick={handleFavoriteToggle}>
						<FavoriteThumb filled={isFavorited} />
					</button>}
					{!!wordObj.is_locked && <span className="word-lock-icon"><FontAwesomeIcon icon={faLock} /></span>}
					<div className="word-item-word word-item-word-no-after">{wordObj.word}</div>
					<span className="word-item-sep">. </span>
					<div className="word-item-def">{wordObj.def}</div>
				</div>
				{metadataSummary && <div className="word-item-def-container">
					<div className="word-item-source">✦ {metadataSummary}</div>
				</div>}
			</div>
			{showPrompt && createPortal(
				<PopupWordPrompt wordObj={wordObj} onClose={() => {
					setShowPrompt(false);
					askAIButtonRef.current?.focus();
				}} />,
				document.body
			)}
			{(props.selectionControl || listType !== 'inbox') && <div className="word-card-actions">
				{listType !== 'inbox' && <button
					type="button"
					className="word-ask-ai-button"
					aria-label={`Ask AI about ${wordObj.word}`}
					title={`Ask AI about ${wordObj.word}`}
					aria-haspopup="dialog"
					ref={askAIButtonRef}
					onClick={(event) => {
						event.stopPropagation();
						setShowPrompt(true);
					}}
				>
					<SparklesIcon />
				</button>}
				{props.selectionControl || <WordCardMenu
					wordObj={wordObj}
					isFavorite={isFavorited} favoritePending={favoritePending} onFavoriteToggle={handleFavoriteToggle}
					listType={listType}
					albumId={props.albumId}
					hasMoodText={props.hasMoodText}
					onWordLockToggle={props.onWordLockToggle}
					onAlbumRefresh={props.onAlbumRefresh}
					popupAlbums={props.popupAlbums}
					onUpdate={() => {
						setUpdateToggle(!updateToggle);
					}}
					readOnly={readOnly}
				/>}
			</div>}
		</div>
	);
}

export default WordEntry;
