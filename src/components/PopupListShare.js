import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy, faCode, faDownload, faFont, faRotate, faQrcode } from '@fortawesome/free-solid-svg-icons';
import PopupHeader from './Popup-Header';
import {
	copyTextToClipboard,
	downloadWordList,
	downloadWordListAsText,
	formatWordListForDownload,
	formatWordListForText,
} from '../utils/page-download';

const LIST_SHARE_FORMAT_KEY = 'wordmage.listShareFormat';
const PUBLIC_APP_URL = 'https://wordmage.app';

function getInitialFormat() {
	if (typeof window === 'undefined') {
		return 'text';
	}

	const savedFormat = window.localStorage.getItem(LIST_SHARE_FORMAT_KEY);
	return savedFormat === 'json' ? 'json' : 'text';
}

function getDefaultShareUrl() {
	if (typeof window === 'undefined') {
		return PUBLIC_APP_URL;
	}

	const { origin } = window.location;
	if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
		return PUBLIC_APP_URL;
	}

	return origin;
}

function PopupListShare(props) {
	const {
		label,
		title = 'Share Word List',
		wordEntries = [],
		shareUrl = getDefaultShareUrl(),
		showWordListOptions = true,
		onRegenerateShare,
		isShareLoading = false,
		shareError = '',
	} = props;
	const [status, setStatus] = useState('');
	const [isWorking, setIsWorking] = useState(false);
	const [selectedFormat, setSelectedFormat] = useState(getInitialFormat);
	const hasShareUrl = Boolean(shareUrl);

	const handleFormatSelect = (format) => {
		setSelectedFormat(format);
		if (typeof window !== 'undefined') {
			window.localStorage.setItem(LIST_SHARE_FORMAT_KEY, format);
		}
	};

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

	const handleCopyShareUrl = async () => {
		if (!shareUrl) {
			return;
		}

		setIsWorking(true);
		setStatus('');

		try {
			const didCopy = await copyTextToClipboard(shareUrl);
			setStatus(didCopy ? 'Copied app link to clipboard' : 'Copy failed');
		} catch (error) {
			console.error('Failed to copy share link:', error);
			setStatus('Copy failed');
		} finally {
			setIsWorking(false);
		}
	};

	return (
		<div>
			<PopupHeader>{title}</PopupHeader>

			<div className="popup-body">
				{showWordListOptions && (
					<>
						<div className="list-share-section-title">Format</div>
						<div className="button-wrapper list-share-format-buttons list-share-section">
							<button
								type="button"
								className={`btn btn-share${selectedFormat === 'text' ? ' selected' : ''}`}
								onClick={() => handleFormatSelect('text')}
								disabled={isWorking || wordEntries.length === 0}
							>
								<div className="share-btn-label">
									<div><FontAwesomeIcon icon={faFont} /></div>
									<div>Text</div>
								</div>
							</button>
							<button
								type="button"
								className={`btn btn-share${selectedFormat === 'json' ? ' selected' : ''}`}
								onClick={() => handleFormatSelect('json')}
								disabled={isWorking || wordEntries.length === 0}
							>
								<div className="share-btn-label">
									<div><FontAwesomeIcon icon={faCode} /></div>
									<div>JSON</div>
								</div>
							</button>
						</div>

						<div className="list-share-section-title">Action</div>
						<div className="button-wrapper list-share-action-buttons list-share-section">
							<button
								type="button"
								className="btn btn-share"
								onClick={handleCopy}
								disabled={isWorking || wordEntries.length === 0}
							>
								<div className="share-btn-label">
									<div><FontAwesomeIcon icon={faCopy} /></div>
									<div>Copy</div>
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
									<div>Download</div>
								</div>
							</button>
						</div>
					</>
				)}

				<div className="list-share-section-title">App Link</div>
				<div className="list-share-qr-panel">
					{hasShareUrl ? (
						<>
							<div className="list-share-qr-code" aria-label={`QR code for ${shareUrl}`}>
								<QRCodeSVG
									value={shareUrl}
									size={156}
									level="M"
									includeMargin
								/>
							</div>
							<button
								type="button"
								className="list-share-url-row"
								onClick={handleCopyShareUrl}
								disabled={isWorking}
								title="Copy app link"
								aria-label={`Copy app link ${shareUrl}`}
							>
								<FontAwesomeIcon icon={faQrcode} />
								<span>{shareUrl}</span>
							</button>
						</>
					) : (
						<div className="list-share-qr-placeholder">
							{isShareLoading ? 'Creating share snapshot...' : 'Share link unavailable'}
						</div>
					)}
				</div>
				{onRegenerateShare && (
					<div className="button-wrapper stack-buttons list-share-section">
						<button
							type="button"
							className="btn btn-share"
							onClick={onRegenerateShare}
							disabled={isWorking || isShareLoading}
						>
							<div className="share-btn-label">
								<div><FontAwesomeIcon icon={faRotate} /></div>
								<div>{isShareLoading ? 'Regenerating...' : 'Regenerate QR'}</div>
							</div>
						</button>
					</div>
				)}

				{status && (
					<div className="list-share-status">
						<FontAwesomeIcon icon={faCheck} /> {status}
					</div>
				)}
				{shareError && (
					<div className="list-share-status list-share-error">
						{shareError}
					</div>
				)}
			</div>
		</div>
	);
}

export default PopupListShare;
