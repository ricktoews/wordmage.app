import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPlus } from '@fortawesome/free-solid-svg-icons';
import { CONFIG } from '../config';

function PopupAlbumSelect(props) {
    const { wordObj, closeAlbumPopup } = props;
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newAlbumTitle, setNewAlbumTitle] = useState('');

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
                const sortedAlbums = data.sort((a, b) => {
                    // Always put "Favorites" at the top, "Learn" second
                    if (a.title === 'Favorites') return -1;
                    if (b.title === 'Favorites') return 1;
                    if (a.title === 'Learn') return -1;
                    if (b.title === 'Learn') return 1;
                    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
                });
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
            const wordId = wordObj.id || wordObj._id;
            console.log('====> Adding word to album:', { albumId: album.id, wordId });
            const response = await fetch(`${CONFIG.domain}/albums/add-word`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    album_id: album.id,
                    word_id: wordId
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

    const handleCreateAlbum = async () => {
        if (!newAlbumTitle.trim()) {
            return;
        }

        try {
            const wordId = wordObj.id || wordObj._id;
            console.log('====> Creating album and adding word:', { newAlbumTitle, wordId });
            // Create the album
            const createResponse = await fetch(`${CONFIG.domain}/albums`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newAlbumTitle.trim(),
                    word_ids: [wordId]
                })
            });

            if (createResponse.ok) {
                console.log('Album created and word added successfully');
                closeAlbumPopup();
            } else {
                console.error('Failed to create album:', createResponse.status);
                alert('Failed to create album. Please try again.');
            }
        } catch (error) {
            console.error('Error creating album:', error);
            alert('Error creating album. Please try again.');
        }
    };

    const handleCreateClick = () => {
        setShowCreateForm(true);
    };

    const handleCancelCreate = () => {
        setShowCreateForm(false);
        setNewAlbumTitle('');
    };

    return (
        <div className="popup-album-select">
            <div className="popup-header">
                <h3>Add to Album</h3>
                <button className="popup-close-button" onClick={closeAlbumPopup}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </div>

            <div className="popup-content">
                {loading ? (
                    <div className="loading-message">Loading albums...</div>
                ) : showCreateForm ? (
                    <div className="create-album-form">
                        <div className="form-group">
                            <label htmlFor="new-album-title">Album Title</label>
                            <input
                                id="new-album-title"
                                type="text"
                                className="form-control"
                                value={newAlbumTitle}
                                onChange={(e) => setNewAlbumTitle(e.target.value.slice(0, 35))}
                                maxLength={35}
                                placeholder="Enter album title (max 35 characters)"
                                autoFocus
                            />
                            <div className="character-count">{newAlbumTitle.length}/35</div>
                        </div>
                        <div className="button-wrapper">
                            <button className="btn btn-default" onClick={handleCancelCreate}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleCreateAlbum} disabled={!newAlbumTitle.trim()}>
                                Create & Add Word
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="album-list">
                            {albums.length === 0 ? (
                                <div className="no-albums-message">
                                    No albums found. Create one below.
                                </div>
                            ) : (
                                albums.map(album => (
                                    <button
                                        key={album.id}
                                        className="album-list-item"
                                        onClick={() => handleAlbumClick(album)}
                                    >
                                        <span className="album-list-title">{album.title}</span>
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="create-album-button-container">
                            <button className="btn btn-create-album" onClick={handleCreateClick}>
                                <FontAwesomeIcon icon={faPlus} /> Create New Album
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default PopupAlbumSelect;
