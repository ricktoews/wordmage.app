import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import WordsInterface from '../utils/words-interface';
import WordCardMenu from './WordCardMenu';
import PopupAlbumSelect from './PopupAlbumSelect';
import Popup from './Popup';
import './History.scss';

function History(props) {
	const [history, setHistory] = useState(() => WordsInterface.getBrowseHistory());
	const [showConfirmClear, setShowConfirmClear] = useState(false);
	const [showAlbums, setShowAlbums] = useState(false);
	const [albumWordObj, setAlbumWordObj] = useState({});

	const handleRemoveWord = useCallback((word) => {
		WordsInterface.removeFromBrowseHistory(word);
		setHistory(WordsInterface.getBrowseHistory());
	}, []);

	const handleClearAll = useCallback(() => {
		WordsInterface.clearBrowseHistory();
		setHistory([]);
		setShowConfirmClear(false);
	}, []);

	const popupAlbums = (wordObj) => {
		setShowAlbums(true);
		setAlbumWordObj(wordObj);
	};

	const closeAlbumPopup = () => {
		setShowAlbums(false);
	};

	const handleAlbumRefresh = () => {
		// Refresh history after album operations
		setHistory(WordsInterface.getBrowseHistory());
	};

	const formatDate = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) {
			return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
		} else if (date.toDateString() === yesterday.toDateString()) {
			return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
		} else {
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
		}
	};

	return (
		<div className="browse-container">
			<div className="history-toolbar">
				<div className="history-toolbar-title">Words That Caught My Eye</div>
				{history.length > 0 && (
					<button
						className="history-clear-btn"
						onClick={() => setShowConfirmClear(true)}
						title="Clear all history"
						aria-label="Clear all history"
					>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				)}
			</div>

			<div className="history-content">
				{history.length === 0 ? (
					<div className="history-empty">
						<p>No words in your history yet.</p>
						<p>Words you browse or interact with will appear here.</p>
					</div>
				) : (
					<div className="history-list">
						{history.map((item, index) => (
							<div key={index} className="history-item">
								<div className="history-item-content">
									<div className="history-item-word">{item.word}</div>
									<div className="history-item-def">{item.def}</div>
									<div className="history-item-meta">
										<span className="history-item-timestamp">
											{formatDate(item.lastViewedAt)}
										</span>
										{item.viewCount > 1 && (
											<span className="history-item-viewcount">
												{item.viewCount} views
											</span>
										)}
									</div>
								</div>
								<div className="history-item-actions">
									<WordCardMenu
										wordObj={item}
										listType="history"
										onAlbumRefresh={handleAlbumRefresh}
										popupAlbums={popupAlbums}
									/>
								</div>
								<button
									className="history-item-remove-corner"
									onClick={() => handleRemoveWord(item.word)}
									title="Remove from history"
									aria-label="Remove from history"
								>
									<FontAwesomeIcon icon={faTrashCan} />
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			<Popup isVisible={showConfirmClear} handleBackgroundClick={() => setShowConfirmClear(false)}>
				<div className="popup-header">
					<h2>Clear History</h2>
					<div className="close-icon" onClick={() => setShowConfirmClear(false)}>
						<FontAwesomeIcon icon={faXmark} />
					</div>
				</div>
				<div className="popup-body">
					<p>Are you sure you want to clear all browsing history?</p>
					<div className="button-wrapper">
						<button className="btn btn-default" onClick={() => setShowConfirmClear(false)}>
							Cancel
						</button>
						<button className="btn btn-primary" onClick={handleClearAll}>
							Clear All
						</button>
					</div>
				</div>
			</Popup>

			<Popup isVisible={showAlbums} handleBackgroundClick={closeAlbumPopup}>
				<PopupAlbumSelect
					showAlbums={showAlbums}
					wordObj={albumWordObj}
					listType="history"
					closeAlbumPopup={closeAlbumPopup}
				/>
			</Popup>
		</div>
	);
}

export default History;
