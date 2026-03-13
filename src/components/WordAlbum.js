import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
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

    return (
        <div className="spotlight-list-container favorites-page">
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
                        onAlbumRefresh={fetchAlbum}
                        popupWordForm={props.popupWordForm}
                        toggleSpotlight={props.toggleSpotlight}
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
