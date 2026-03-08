import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { CONFIG } from '../config';

function Albums(props) {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${CONFIG.domain}/albums`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setAlbums(data);
            }
        } catch (error) {
            console.error('Error fetching albums:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAlbumClick = (albumId) => {
        props.history.push(`/albums/${albumId}`);
    };

    return (
        <div className="spotlight-list-container favorites-page">
            <div className="favorites-toolbar">
                <div className="favorites-toolbar-title">Albums</div>
            </div>

            <div className="albums-container">
                {loading ? (
                    <div className="loading">Loading albums...</div>
                ) : albums.length === 0 ? (
                    <div className="empty-state">No albums yet. Create one from a mood!</div>
                ) : (
                    <div className="albums-list">
                        {albums.map((album) => (
                            <div
                                key={album.id}
                                className="album-item"
                                onClick={() => handleAlbumClick(album.id)}
                            >
                                <div className="album-title">{album.title}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default withRouter(Albums);
