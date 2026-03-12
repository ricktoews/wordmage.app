import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { CONFIG } from '../config';
import Popup from './Popup';

function Albums(props) {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [showRenamePopup, setShowRenamePopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        fetchAlbums();
    }, []);

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

    const handleAlbumClick = (albumId) => {
        props.history.push(`/albums/${albumId}`);
    };

    const handleMenuClick = (e, albumId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === albumId ? null : albumId);
    };

    const handleRenameClick = (e, album) => {
        e.stopPropagation();
        setSelectedAlbum(album);
        setNewTitle(album.title);
        setShowRenamePopup(true);
        setOpenMenuId(null);
    };

    const handleDeleteClick = (e, album) => {
        e.stopPropagation();
        setSelectedAlbum(album);
        setShowDeletePopup(true);
        setOpenMenuId(null);
    };

    const handleRenameSubmit = async () => {
        if (!newTitle.trim() || !selectedAlbum) {
            return;
        }

        try {
            const response = await fetch(`${CONFIG.domain}/albums/${selectedAlbum.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: newTitle.trim() })
            });

            if (response.ok) {
                setShowRenamePopup(false);
                setSelectedAlbum(null);
                setNewTitle('');
                fetchAlbums();
            } else {
                alert('Failed to rename album. Please try again.');
            }
        } catch (error) {
            console.error('Error renaming album:', error);
            alert('Error renaming album. Please try again.');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedAlbum) {
            return;
        }

        try {
            const response = await fetch(`${CONFIG.domain}/albums/${selectedAlbum.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setShowDeletePopup(false);
                setSelectedAlbum(null);
                fetchAlbums();
            } else {
                alert('Failed to delete album. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting album:', error);
            alert('Error deleting album. Please try again.');
        }
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
                                <div className="album-menu-container">
                                    <button
                                        className="album-kebab-menu"
                                        onClick={(e) => handleMenuClick(e, album.id)}
                                        aria-label="Album options"
                                    >
                                        <i className="glyphicon glyphicon-option-vertical"></i>
                                    </button>
                                    {openMenuId === album.id && (
                                        <div className="album-menu-dropdown">
                                            <div
                                                className="album-menu-item"
                                                onClick={(e) => handleRenameClick(e, album)}
                                            >
                                                Rename
                                            </div>
                                            <div
                                                className="album-menu-item album-menu-item-delete"
                                                onClick={(e) => handleDeleteClick(e, album)}
                                            >
                                                Delete
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Popup isVisible={showRenamePopup} handleBackgroundClick={() => setShowRenamePopup(false)}>
                <div className="popup-header">
                    <h2>Rename Album</h2>
                    <div className="close-icon" onClick={() => setShowRenamePopup(false)}>
                        <i className="glyphicon glyphicon-remove"></i>
                    </div>
                </div>
                <div className="popup-body">
                    <form onSubmit={(e) => { e.preventDefault(); handleRenameSubmit(); }}>
                        <div className="form-group">
                            <label htmlFor="album-rename-title">Album Title</label>
                            <input
                                id="album-rename-title"
                                type="text"
                                className="form-control"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value.slice(0, 35))}
                                maxLength={35}
                                placeholder="Enter album title"
                                autoFocus
                            />
                        </div>
                        <div className="button-wrapper">
                            <button type="button" className="btn btn-default" onClick={() => setShowRenamePopup(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={!newTitle.trim()}>
                                Rename
                            </button>
                        </div>
                    </form>
                </div>
            </Popup>

            <Popup isVisible={showDeletePopup} handleBackgroundClick={() => setShowDeletePopup(false)}>
                <div className="popup-header">
                    <h2>Delete Album</h2>
                    <div className="close-icon" onClick={() => setShowDeletePopup(false)}>
                        <i className="glyphicon glyphicon-remove"></i>
                    </div>
                </div>
                <div className="popup-body">
                    <p>This cannot be undone. Are you sure?</p>
                    <div className="button-wrapper">
                        <button className="btn btn-default" onClick={() => setShowDeletePopup(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleDeleteConfirm}>
                            Delete
                        </button>
                    </div>
                </div>
            </Popup>
        </div>
    );
}

export default withRouter(Albums);
