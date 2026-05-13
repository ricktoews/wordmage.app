import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import WordsInterface from '../utils/words-interface';
import WordCardMenu from './WordCardMenu';
import { FacebookShareButton, FacebookIcon } from "react-share";
import { TwitterShareButton, XIcon } from "react-share";

function WordEntry(props) {
	const { history } = props;
	const { wordObj, listType } = props;
	const [updateToggle, setUpdateToggle] = useState(false);
	const [showInfo, setShowInfo] = useState(false);
	const sourceList = Array.isArray(wordObj.sources)
		? wordObj.sources.filter(Boolean)
		: wordObj.source
			? [wordObj.source]
			: [];
	const sourceSummary = sourceList.length === 0
		? null
		: sourceList.length === 1
			? sourceList[0]
			: `${sourceList[0]} +${sourceList.length - 1} more`;

	// Check if word is in favorites list (liked array)
	const isFavorited = WordsInterface.isWordLiked(wordObj.word);

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

	return wordObj.divider ? <hr className="rejects" /> : (
		<div className="word-item">
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
					{sourceSummary && (
						<div className="word-item-source">✦ {sourceSummary}</div>
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
					popupTags={props.popupTags}
					popupAlbums={props.popupAlbums}
					onUpdate={() => {
						setUpdateToggle(!updateToggle);
					}}
				/>
			</div>
		</div>
	);
}

export default WordEntry;
