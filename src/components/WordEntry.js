import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import WordsInterface from '../utils/words-interface';
import WordCardMenu from './WordCardMenu';
import { FacebookShareButton, FacebookIcon } from "react-share";
import { TwitterShareButton, XIcon } from "react-share";

function WordEntry(props) {
	const { history } = props;
	const { wordObj, listType, readOnly = false } = props;
	const [updateToggle, setUpdateToggle] = useState(false);
	const [showInfo, setShowInfo] = useState(false);
	const [historySettings, setHistorySettings] = useState(() => WordsInterface.getHistoryScoringSettings());
	const wordItemRef = useRef(null);
	const viewport3sTimerRef = useRef(null);
	const viewport6sTimerRef = useRef(null);
	const scrollStopTimerRef = useRef(null);
	const isFullyVisibleRef = useRef(false);
	const sourceList = Array.isArray(wordObj.sources)
		? wordObj.sources.filter(Boolean)
		: wordObj.source
			? [wordObj.source]
			: [];

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

	const sourceSummary = sourceList.length === 0
		? null
		: sourceList.length === 1
			? sourceList[0]
			: `${sourceList[0]} +${sourceList.length - 1} more`;

	const metadataSummary = listType === 'history'
		? formatHistoryTimestamp(wordObj.lastViewedAt)
		: sourceSummary;

	// Check if word is in favorites list (liked array)
	const isFavorited = WordsInterface.isWordLiked(wordObj.word);

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

	const handleAIExplain = (e) => {
		e.stopPropagation();
		if (props.onAIExplain) {
			props.onAIExplain(wordObj.word, wordObj.def);
		}
	};

	const handleInfoClick = (e) => {
		e.stopPropagation();
		setShowInfo(!showInfo);
	};

	const handleCardTap = () => {
		if (readOnly) return;
		WordsInterface.recordWordInterestSignal(wordObj, 'tap_card', listType);
	};

	return wordObj.divider ? <hr className="rejects" /> : (
		<div className="word-item" ref={wordItemRef} onClick={handleCardTap}>
			<div className="word-content-wrapper">
				<div className="word-item-word-container">
					<div className="word-edit-btn">

					</div>
					{(listType === 'browse' || listType === 'random') && isFavorited && <span className="featured-word-icon"><FontAwesomeIcon icon={faThumbsUp} /></span>}
					{!!wordObj.is_locked && <span className="word-lock-icon"><FontAwesomeIcon icon={faLock} /></span>}
					<div className="word-item-word word-item-word-no-after">{wordObj.word}</div>
					<span className="word-item-sep">. </span>
					<div className="word-item-def">{wordObj.def}</div>
				</div>
				<div className="word-item-def-container">
					{metadataSummary && (
						<div className="word-item-source">✦ {metadataSummary}</div>
					)}
					{showInfo && (
						<div className="word-info-popup">
							{wordObj.sources ? (
								<>
									{wordObj.sources.map((source, index) => (
										source && <div key={index}><strong>Source {index + 1}:</strong> {source}</div>
									))}
								</>
							) : wordObj.source ? (
								<>
									<strong>Source:</strong> {wordObj.source}
								</>
							) : (
								<span>No source information available</span>
							)}
						</div>
					)}
				</div>
			</div>
			{!readOnly && (
			<div className="word-card-actions">
				{/*}
			<button 
				className="word-info-button"
				onClick={handleInfoClick}
				aria-label="Word information"
			>
				<InfoIcon />
			</button>
			*/}
				<WordCardMenu
					wordObj={wordObj}
					listType={listType}
					albumId={props.albumId}
					hasMoodText={props.hasMoodText}
					onWordLockToggle={props.onWordLockToggle}
					onAlbumRefresh={props.onAlbumRefresh}
					popupAlbums={props.popupAlbums}
					onUpdate={() => {
						setUpdateToggle(!updateToggle);
					}}
				/>
			</div>
			)}
		</div>
	);
}

export default WordEntry;
