import { useEffect, useMemo, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import WordScroller from './WordScroller';
import { CONFIG } from '../config';
import { authFetch } from '../utils/auth';

function SharedAlbum(props) {
	const [album, setAlbum] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [keepLoading, setKeepLoading] = useState(false);
	const [keepError, setKeepError] = useState('');
	const shareToken = props.match.params.token;

	useEffect(() => {
		let isCancelled = false;

		const fetchSharedAlbum = async () => {
			setLoading(true);
			setError('');

			try {
				const response = await fetch(`${CONFIG.domain}/shared/albums/${shareToken}`, {
					cache: 'no-store'
				});

				if (!response.ok) {
					throw new Error(`Failed to load shared album: ${response.status}`);
				}

				const data = await response.json();
				if (!isCancelled) {
					setAlbum(data);
				}
			} catch (fetchError) {
				console.error('Error loading shared album:', fetchError);
				if (!isCancelled) {
					setError('Shared album not found.');
					setAlbum(null);
				}
			} finally {
				if (!isCancelled) {
					setLoading(false);
				}
			}
		};

		fetchSharedAlbum();

		return () => {
			isCancelled = true;
		};
	}, [shareToken]);

	const words = useMemo(() => {
		return (album?.words || [])
			.filter((wordEntry) => wordEntry?.word)
			.map((wordEntry) => ({
				...wordEntry,
				def: wordEntry.definition || wordEntry.def || '',
			}));
	}, [album?.words]);

	const wordListVersion = words.map((wordEntry) => wordEntry.word).join('|') || 'empty';

	const handleKeepAlbum = async () => {
		setKeepLoading(true);
		setKeepError('');

		try {
			const response = await authFetch(`${CONFIG.domain}/shared/albums/${shareToken}/keep`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});

			if (!response.ok) {
				throw new Error(`Failed to keep shared album: ${response.status}`);
			}

			const data = await response.json();
			if (!data?.album_id) {
				throw new Error('Keep album response did not include album_id');
			}

			props.history.push(`/albums/${data.album_id}`);
		} catch (keepAlbumError) {
			console.error('Error keeping shared album:', keepAlbumError);
			setKeepError('Could not keep this album. Please try again.');
		} finally {
			setKeepLoading(false);
		}
	};

	return (
		<div className="word-list-page-container album-content-page album-theme-classic shared-album-page">
			<div className="favorites-toolbar">
				<div className="favorites-toolbar-content">
					<div className="favorites-toolbar-title">Shared Album</div>
					{album?.title && (
						<div className="album-title-subtitle">
							<span>{album.title}</span>
						</div>
					)}
				</div>
				<div className="moods-toolbar-actions">
					<button
						type="button"
						className="moods-refresh-icon shared-album-keep-button"
						onClick={handleKeepAlbum}
						disabled={loading || !!error || keepLoading}
						title="Keep album"
						aria-label="Keep album"
					>
						<FontAwesomeIcon icon={faBookmark} />
					</button>
				</div>
			</div>

			{keepError && (
				<div className="shared-album-message shared-album-error">
					{keepError}
				</div>
			)}

			{album?.mood_text && (
				<div className="shared-album-mood">
					{album.mood_text}
				</div>
			)}

			<div className="album-words-container">
				{loading ? (
					<div className="loading">Loading shared album...</div>
				) : error ? (
					<div className="empty-state album-empty-state">
						<div className="empty-state-title">{error}</div>
					</div>
				) : words.length === 0 ? (
					<div className="empty-state album-empty-state">
						<div className="empty-state-title">No words in this shared album.</div>
					</div>
				) : (
					<WordScroller
						key={`shared-album-${shareToken}-${wordListVersion}`}
						pool={words}
						startingNdx={0}
						listType="shared-album"
					/>
				)}
			</div>
		</div>
	);
}

export default withRouter(SharedAlbum);
