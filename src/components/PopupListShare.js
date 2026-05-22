import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy, faCode, faDownload, faFont } from '@fortawesome/free-solid-svg-icons';
import PopupHeader from './Popup-Header';
import {
	copyTextToClipboard,
	downloadWordList,
	downloadWordListAsText,
	formatWordListForDownload,
	formatWordListForText,
} from '../utils/page-download';

function PopupListShare(props) {
	const { label, title = 'Share Word List', wordEntries = [] } = props;
	const [status, setStatus] = useState('');
	const [isWorking, setIsWorking] = useState(false);
	const [selectedFormat, setSelectedFormat] = useState('text');

	const buildContent = (format) => {
		return format === 'json'
			? formatWordListForDownload(wordEntries)
			: formatWordListForText({ label, wordEntries });
	};

	const handleCopy = async () => {
		setIsWorking(true);
		setStatus('');

		try {
			const content = buildContent(selectedFormat);
			const didCopy = await copyTextToClipboard(content);
			setStatus(didCopy ? `Copied ${selectedFormat.toUpperCase()} to clipboard` : 'Copy failed');
		} catch (error) {
			console.error('Failed to copy word list:', error);
			setStatus('Copy failed');
		} finally {
			setIsWorking(false);
		}
	};

	const handleDownload = () => {
		setIsWorking(true);
		setStatus('');

		try {
			if (selectedFormat === 'json') {
				downloadWordList({ label, wordEntries });
			} else {
				downloadWordListAsText({ label, wordEntries });
			}
			setStatus(`Downloaded ${selectedFormat.toUpperCase()} file`);
		} catch (error) {
			console.error('Failed to download word list:', error);
			setStatus('Download failed');
		} finally {
			setIsWorking(false);
		}
	};

	return (
		<div>
			<PopupHeader>{title}</PopupHeader>

			<div className="popup-body">
				<div className="list-share-section-title">Format</div>
				<div className="button-wrapper stack-buttons list-share-section">
					<button
						type="button"
						className={`btn btn-share${selectedFormat === 'text' ? ' selected' : ''}`}
						onClick={() => setSelectedFormat('text')}
						disabled={isWorking || wordEntries.length === 0}
					>
						<div className="share-btn-label">
							<div><FontAwesomeIcon icon={faFont} /></div>
							<div>Formatted Text</div>
						</div>
					</button>
					<button
						type="button"
						className={`btn btn-share${selectedFormat === 'json' ? ' selected' : ''}`}
						onClick={() => setSelectedFormat('json')}
						disabled={isWorking || wordEntries.length === 0}
					>
						<div className="share-btn-label">
							<div><FontAwesomeIcon icon={faCode} /></div>
							<div>JSON</div>
						</div>
					</button>
				</div>

				<div className="list-share-section-title">Action</div>
				<div className="button-wrapper stack-buttons list-share-section">
					<button
						type="button"
						className="btn btn-share"
						onClick={handleCopy}
						disabled={isWorking || wordEntries.length === 0}
					>
						<div className="share-btn-label">
							<div><FontAwesomeIcon icon={faCopy} /></div>
							<div>Copy to Clipboard</div>
						</div>
					</button>
					<button
						type="button"
						className="btn btn-share"
						onClick={handleDownload}
						disabled={isWorking || wordEntries.length === 0}
					>
						<div className="share-btn-label">
							<div><FontAwesomeIcon icon={faDownload} /></div>
							<div>Download File</div>
						</div>
					</button>
				</div>

				{status && (
					<div className="list-share-status">
						<FontAwesomeIcon icon={faCheck} /> {status}
					</div>
				)}
			</div>
		</div>
	);
}

export default PopupListShare;