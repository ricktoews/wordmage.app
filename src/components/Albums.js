import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faXmark, faPlus, faThumbsUp, faLeaf } from '@fortawesome/free-solid-svg-icons';
import { CONFIG } from '../config';
import Popup from './Popup';

function randomizeWords(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function Albums(props) {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [showRenamePopup, setShowRenamePopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const [editMoodText, setEditMoodText] = useState('');
    const [createTitle, setCreateTitle] = useState('');
    const [moodPrompt, setMoodPrompt] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${CONFIG.domain}/albums`);
            const data = await response.json();
            if (Array.isArray(data)) {
                // Sort albums, but always put "Favorites" first and "Learn" second
                const sortedAlbums = data.sort((a, b) => {
                    // If either album is "Favorites", it goes first
                    if (a.title === 'Favorites') return -1;
                    if (b.title === 'Favorites') return 1;
                    // If either album is "Learn", it goes second
                    if (a.title === 'Learn') return -1;
                    if (b.title === 'Learn') return 1;
                    // Otherwise, sort alphabetically
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

    const handleAlbumClick = (albumId) => {
        props.history.push(`/albums/${albumId}`);
    };

    const handleFavoritesClick = () => {
        const favoritesAlbum = albums.find(album => album.title === 'Favorites');
        if (favoritesAlbum) {
            props.history.push(`/albums/${favoritesAlbum.id}`);
        }
    };

    const handleLearnClick = () => {
        const learnAlbum = albums.find(album => album.title === 'Learn');
        if (learnAlbum) {
            props.history.push(`/albums/${learnAlbum.id}`);
        }
    };

    const handleMenuClick = (e, albumId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === albumId ? null : albumId);
    };

    const handleRenameClick = (e, album) => {
        e.stopPropagation();
        setSelectedAlbum(album);
        setNewTitle(album.title);
        setEditMoodText(album.mood_text || '');
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
                body: JSON.stringify({
                    title: newTitle.trim(),
                    mood_text: editMoodText.trim()
                })
            });

            if (response.ok) {
                setShowRenamePopup(false);
                setSelectedAlbum(null);
                setNewTitle('');
                setEditMoodText('');
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

    const handleCreateAlbumClick = () => {
        setCreateTitle('');
        setMoodPrompt('');
        setShowCreatePopup(true);
    };

    const fetchVibeWords = async (vibe) => {
        try {
            const response = await fetch(`${CONFIG.domain}/custom-mood`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mood_text: vibe
                })
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                return randomizeWords(data);
            }
            return [];
        } catch (error) {
            console.error('Error fetching vibe words:', error);
            throw error;
        }
    };

    const handleCreateAlbumSubmit = async () => {
        if (!createTitle.trim()) {
            return;
        }

        setIsCreating(true);
        try {
            let wordIds = [];

            // If mood prompt is provided, fetch words based on it
            if (moodPrompt.trim()) {
                const moodWords = await fetchVibeWords(moodPrompt.trim());
                wordIds = moodWords.map(word => word.id).filter(id => id != null);
            }

            const payload = {
                title: createTitle.trim(),
                ...(moodPrompt.trim() && { mood_text: moodPrompt.trim() }),
                word_ids: wordIds
            };

            const response = await fetch(`${CONFIG.domain}/albums`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowCreatePopup(false);
                setCreateTitle('');
                setMoodPrompt('');
                fetchAlbums();
            } else {
                alert('Failed to create album. Please try again.');
            }
        } catch (error) {
            console.error('Error creating album:', error);
            alert('Error creating album. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="word-list-page-container favorites-page">
            <div className="favorites-toolbar">
                <div className="favorites-toolbar-title">Albums</div>
                <div className="favorites-toolbar-actions">
                    <button
                        className="btn btn-primary create-album-btn"
                        onClick={handleCreateAlbumClick}
                        title="Create Album"
                    >
                        <FontAwesomeIcon icon={faPlus} /> Create Album
                    </button>
                </div>
            </div>

            <div className="albums-container">
                {loading ? null : albums.length === 0 ? (
                    <div className="empty-state">No albums yet. Create one from a mood!</div>
                ) : (
                    <>
                        <div className="album-quick-access">
                            <button
                                className="btn btn-favorites album-quick-btn"
                                onClick={handleFavoritesClick}
                                title="Favorites"
                            >
                                <FontAwesomeIcon icon={faThumbsUp} /> Favorites
                            </button>
                            <button
                                className="btn btn-learn album-quick-btn"
                                onClick={handleLearnClick}
                                title="Learn"
                            >
                                <FontAwesomeIcon icon={faLeaf} /> Learn
                            </button>
                        </div>
                        <div className="albums-list">
                            {albums.filter(album => album.title !== 'Favorites' && album.title !== 'Learn').map((album) => (
                                <div
                                    key={album.id}
                                    className="album-item"
                                    onClick={() => handleAlbumClick(album.id)}
                                >
                                    <div className="album-title">{album.title}</div>
                                    {album.title !== 'Favorites' && album.title !== 'Learn' && (
                                        <div className="album-menu-container">
                                            <button
                                                className="album-kebab-menu"
                                                onClick={(e) => handleMenuClick(e, album.id)}
                                                aria-label="Album options"
                                            >
                                                <FontAwesomeIcon icon={faEllipsisVertical} />
                                            </button>
                                            {openMenuId === album.id && (
                                                <div className="album-menu-dropdown">
                                                    <div
                                                        className="album-menu-item"
                                                        onClick={(e) => handleRenameClick(e, album)}
                                                    >
                                                        Edit
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
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <Popup isVisible={showRenamePopup} handleBackgroundClick={() => setShowRenamePopup(false)}>
                <div className="popup-header">
                    <h2>Edit Album</h2>
                    <div className="close-icon" onClick={() => setShowRenamePopup(false)}>
                        <FontAwesomeIcon icon={faXmark} />
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
                        <div className="form-group">
                            <label htmlFor="album-edit-mood-text">Mood Text</label>
                            <textarea
                                id="album-edit-mood-text"
                                className="form-control"
                                value={editMoodText}
                                onChange={(e) => setEditMoodText(e.target.value)}
                                placeholder="Enter mood text"
                                rows={3}
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
                        <FontAwesomeIcon icon={faXmark} />
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

            <Popup isVisible={showCreatePopup} handleBackgroundClick={() => !isCreating && setShowCreatePopup(false)}>
                <div className="popup-header">
                    <h2>Create Album</h2>
                    <div className="close-icon" onClick={() => !isCreating && setShowCreatePopup(false)}>
                        <FontAwesomeIcon icon={faXmark} />
                    </div>
                </div>
                <div className="popup-body">
                    <form onSubmit={(e) => { e.preventDefault(); handleCreateAlbumSubmit(); }}>
                        <div className="form-group">
                            <label htmlFor="album-create-title">Album Title <span className="required">*</span></label>
                            <input
                                id="album-create-title"
                                type="text"
                                className="form-control"
                                value={createTitle}
                                onChange={(e) => setCreateTitle(e.target.value.slice(0, 35))}
                                maxLength={35}
                                placeholder="Enter album title"
                                autoFocus
                                disabled={isCreating}
                            />
                            <div className="character-count">{createTitle.length}/35</div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="mood-prompt">Mood Prompt (optional)</label>
                            <input
                                id="mood-prompt"
                                type="text"
                                className="form-control"
                                value={moodPrompt}
                                onChange={(e) => setMoodPrompt(e.target.value)}
                                placeholder="e.g., melancholic, joyful, mysterious"
                                disabled={isCreating}
                            />
                            <small className="form-text">If provided, words matching this mood will be added to the album</small>
                        </div>
                        <div className="button-wrapper">
                            <button
                                type="button"
                                className="btn btn-default"
                                onClick={() => setShowCreatePopup(false)}
                                disabled={isCreating}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!createTitle.trim() || isCreating}
                            >
                                {isCreating ? 'Creating...' : 'Create Album'}
                            </button>
                        </div>
                    </form>
                </div>
            </Popup>
        </div>
    );
}

export default withRouter(Albums);
