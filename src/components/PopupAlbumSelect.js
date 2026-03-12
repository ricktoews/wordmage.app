import { useEffect, useState } from 'react';
import { CONFIG } from '../config';

function PopupAlbumSelect(props) {
    const { wordObj, closeAlbumPopup } = props;
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (props.showAlbums) {
            fetchAlbums();
        }
    }, [props.showAlbums]);

    const fetchAlbums = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${CONFIG.domain}/albums`);
            const data = await response.json();
            if (Array.isArray(data)) {
                const sortedAlbums = data.sort((a, b) =>
                    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
                );
                setAlbums(sortedAlbums);
            }
        } catch (error) {
            console.error('Error fetching albums:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAlbumClick = async (album) => {
        try {
            const response = await fetch(`${CONFIG.domain}/albums/add-word`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    album_id: album.id,
                    word_id: wordObj.id
                })
            });

            if (response.ok) {
                console.log('Word added to album successfully');
                closeAlbumPopup();
            } else {
                console.error('Failed to add word to album:', response.status);
                alert('Failed to add word to album. Please try again.');
            }
        } catch (error) {
            console.error('Error adding word to album:', error);
            alert('Error adding word to album. Please try again.');
        }
    };

    return (
        <div className="popup-album-select">
            <div className="popup-header">
                <h3>Add to Album</h3>
                <button className="popup-close-button" onClick={closeAlbumPopup}>
                    <i className="glyphicon glyphicon-remove"></i>
                </button>
            </div>

            <div className="popup-content">
                {loading ? (
                    <div className="loading-message">Loading albums...</div>
                ) : albums.length === 0 ? (
                    <div className="no-albums-message">
                        No albums found. Create an album first from the Moods page.
                    </div>
                ) : (
                    <div className="album-list">
                        {albums.map(album => (
                            <button
                                key={album.id}
                                className="album-list-item"
                                onClick={() => handleAlbumClick(album)}
                            >
                                <span className="album-list-title">{album.title}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PopupAlbumSelect;
