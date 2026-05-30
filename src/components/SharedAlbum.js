import { useEffect, useMemo, useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordScroller from './WordScroller';
import { CONFIG } from '../config';

function SharedAlbum(props) {
	const [album, setAlbum] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
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
			</div>

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
						readOnly
					/>
				)}
			</div>
		</div>
	);
}

export default withRouter(SharedAlbum);
