import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faRotate } from '@fortawesome/free-solid-svg-icons';
import WordScroller from './WordScroller';
import { CONFIG } from '../config';

function WordAlbum(props) {
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(false);
    const albumId = props.match.params.id;

    useEffect(() => {
        if (albumId) {
            fetchAlbum();
        }
    }, [albumId]);

    const fetchAlbum = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${CONFIG.domain}/albums/${albumId}`);
            const data = await response.json();

            // Sort words alphabetically for Favorites and Learn albums
            if (data.words && (data.title === 'Favorites' || data.title === 'Learn')) {
                data.words.sort((a, b) => a.word.localeCompare(b.word));
            }

            setAlbum(data);
        } catch (error) {
            console.error('Error fetching album:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToAlbums = () => {
        props.history.push('/albums');
    };

    const handleWordLockToggle = (wordId, isLocked) => {
        setAlbum(prevAlbum => ({
            ...prevAlbum,
            words: prevAlbum.words.map(word =>
                word.id === wordId ? { ...word, is_locked: isLocked } : word
            )
        }));
    };

    const handleRefreshMoodWords = async () => {
        if (!albumId) return;

        setLoading(true);
        try {
            const response = await fetch(`${CONFIG.domain}/albums/${albumId}/refresh`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error(`Failed to refresh album: ${response.status}`);
            }

            fetchAlbum();
        } catch (error) {
            console.error('Error refreshing mood words:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="word-list-page-container favorites-page">
            <div className="favorites-toolbar">
                <div className="favorites-toolbar-content">
                    <div className="favorites-toolbar-title">
                        Word Album
                    </div>
                    {album?.title && (
                        <div className="album-title-subtitle">{album.title}</div>
                    )}
                </div>
                <div className="moods-toolbar-actions">
                    {album?.mood_text && (
                        <button
                            className="moods-refresh-icon"
                            onClick={handleRefreshMoodWords}
                            title="Refresh mood words"
                            aria-label="Refresh mood words"
                        >
                            <FontAwesomeIcon icon={faRotate} />
                        </button>
                    )}
                    <button
                        className="moods-refresh-icon"
                        onClick={handleBackToAlbums}
                        title="Back to Albums"
                        aria-label="Back to Albums"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                </div>
            </div>

            <div className="album-words-container">
                {loading ? (
                    <div className="loading">Loading album...</div>
                ) : album && album.words ? (
                    <WordScroller
                        pool={album.words}
                        startingNdx={0}
                        listType={'album'}
                        albumId={albumId}
                        hasMoodText={!!album.mood_text}
                        onWordLockToggle={handleWordLockToggle}
                        onAlbumRefresh={fetchAlbum}
                        popupWordForm={props.popupWordForm}
                        onAIExplain={props.onAIExplain}
                    />
                ) : (
                    <div className="empty-state">Album not found</div>
                )}
            </div>
        </div>
    );
}

export default withRouter(WordAlbum);
