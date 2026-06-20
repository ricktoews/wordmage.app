import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import WordsInterface from '../utils/words-interface';
import WordScroller from './WordScroller';
import PopupAlbumSelect from './PopupAlbumSelect';
import Popup from './Popup';
import './History.scss';

const ALBUM_THEMES = ['classic', 'paper', 'ink', 'arcane', 'eldritch', 'obsidian', 'fogbound'];

function History(props) {
	const [history, setHistory] = useState(() => WordsInterface.getBrowseHistory());
	const [showConfirmClear, setShowConfirmClear] = useState(false);
	const [showAlbums, setShowAlbums] = useState(false);
	const [albumWordObj, setAlbumWordObj] = useState({});
	const [albumTheme] = useState(() => {
		if (typeof window === 'undefined') {
			return 'paper';
		}

		const savedTheme = window.localStorage.getItem('wordmage.albumTheme');
		return ALBUM_THEMES.includes(savedTheme) ? savedTheme : 'paper';
	});

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

	return (
		<div className={`word-list-page-container album-content-page album-theme-${albumTheme}`}>
			<div className="favorites-toolbar">
				<div className="favorites-toolbar-content">
					<div className="favorites-toolbar-title">
						History
					</div>
				</div>
				<div className="moods-toolbar-actions">
					{history.length > 0 && (
						<button
							type="button"
							className="moods-refresh-icon"
							onClick={() => setShowConfirmClear(true)}
							title="Clear all history"
							aria-label="Clear all history"
						>
							<FontAwesomeIcon icon={faTrash} />
						</button>
					)}
				</div>
			</div>

			<div className="word-list-wrapper">
				{history.length === 0 ? (
					<div className="history-empty">
						<p>No words in your history yet.</p>
						<p>Words you browse or interact with will appear here.</p>
					</div>
				) : (
					<WordScroller
						pool={history}
						startingNdx={0}
						listType="history"
						onAlbumRefresh={handleAlbumRefresh}
						popupAlbums={popupAlbums}
					/>
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
					<p>Are you sure you want to clear all word browsing history?</p>
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
