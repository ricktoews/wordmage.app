import { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faXmark, faPlus, faThumbsUp, faLeaf, faPalette } from '@fortawesome/free-solid-svg-icons';
import { CONFIG } from '../config';
import Popup from './Popup';

const ALBUM_THEMES = ['classic', 'paper', 'ink', 'arcane', 'eldritch', 'obsidian', 'fogbound'];
const ALBUM_THEME_LABELS = {
    classic: 'Literary',
    paper: 'Parchment',
    ink: 'Nocturne',
    arcane: 'Arcane',
    eldritch: 'Eldritch',
    obsidian: 'Obsidian',
    fogbound: 'Fogbound'
};

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
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const [albumTheme, setAlbumTheme] = useState(() => {
        if (typeof window === 'undefined') {
            return 'classic';
        }

        const savedTheme = window.localStorage.getItem('wordmage.albumTheme');
        return ALBUM_THEMES.includes(savedTheme) ? savedTheme : 'classic';
    });
    const themeMenuRef = useRef(null);
    const themeToggleButtonRef = useRef(null);
    const themeClickTimerRef = useRef(null);
    const lastThemeToggleClickRef = useRef(0);

    const THEME_DOUBLE_TAP_MS = 280;

    useEffect(() => {
        fetchAlbums();
    }, []);

    useEffect(() => {
        window.localStorage.setItem('wordmage.albumTheme', albumTheme);

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('wordmage:albumThemeChanged', {
                detail: { theme: albumTheme }
            }));
        }
    }, [albumTheme]);

    useEffect(() => {
        const syncAlbumTheme = (themeOverride) => {
            const storedTheme = themeOverride || window.localStorage.getItem('wordmage.albumTheme');
            setAlbumTheme(ALBUM_THEMES.includes(storedTheme) ? storedTheme : 'classic');
        };

        const handleAlbumThemeChanged = (event) => {
            syncAlbumTheme(event?.detail?.theme);
        };

        const handleStorage = (event) => {
            if (event.key === 'wordmage.albumTheme') {
                syncAlbumTheme();
            }
        };

        window.addEventListener('wordmage:albumThemeChanged', handleAlbumThemeChanged);
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener('wordmage:albumThemeChanged', handleAlbumThemeChanged);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    useEffect(() => {
        if (!showThemeMenu) {
            return undefined;
        }

        const handleOutsideThemeMenuClick = (event) => {
            const target = event.target;

            if (themeMenuRef.current?.contains(target) || themeToggleButtonRef.current?.contains(target)) {
                return;
            }

            setShowThemeMenu(false);
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setShowThemeMenu(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideThemeMenuClick);
        document.addEventListener('touchstart', handleOutsideThemeMenuClick, { passive: true });
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleOutsideThemeMenuClick);
            document.removeEventListener('touchstart', handleOutsideThemeMenuClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showThemeMenu]);

    useEffect(() => {
        return () => {
            if (themeClickTimerRef.current) {
                clearTimeout(themeClickTimerRef.current);
            }
        };
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

    const handleExportClick = async (e, album) => {
        e.stopPropagation();
        setOpenMenuId(null);

        try {
            const response = await fetch(`${CONFIG.domain}/albums/${album.id}`);
            const data = await response.json();

            const exportData = {
                album: {
                    title: data.title,
                    mood: data.mood_text || ''
                },
                words: (data.words || []).map((word, index) => ({
                    id: word.id,
                    word: word.word,
                    definition: word.definition,
                    position: word.position ?? index + 1
                }))
            };

            const filename = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            const json = JSON.stringify(exportData, null, 2);
            const file = new File([json], filename, { type: 'application/json' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ title: 'WordMage Album', files: [file] });
            } else {
                const url = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting album:', error);
            alert('Failed to export album. Please try again.');
        }
    };

    const handleCreateAlbumClick = () => {
        setCreateTitle('');
        setMoodPrompt('');
        setShowCreatePopup(true);
    };

    const cycleAlbumTheme = () => {
        setAlbumTheme((currentTheme) => {
            const currentIndex = ALBUM_THEMES.indexOf(currentTheme);
            const nextIndex = (currentIndex + 1) % ALBUM_THEMES.length;
            return ALBUM_THEMES[nextIndex];
        });
    };

    const handleThemeToggleClick = () => {
        const now = Date.now();
        const msSinceLastClick = now - lastThemeToggleClickRef.current;

        if (msSinceLastClick > 0 && msSinceLastClick <= THEME_DOUBLE_TAP_MS) {
            if (themeClickTimerRef.current) {
                clearTimeout(themeClickTimerRef.current);
                themeClickTimerRef.current = null;
            }
            lastThemeToggleClickRef.current = 0;
            setShowThemeMenu((prev) => !prev);
            return;
        }

        lastThemeToggleClickRef.current = now;
        if (themeClickTimerRef.current) {
            clearTimeout(themeClickTimerRef.current);
        }

        themeClickTimerRef.current = setTimeout(() => {
            cycleAlbumTheme();
            themeClickTimerRef.current = null;
        }, THEME_DOUBLE_TAP_MS);
    };

    const handleThemeSelect = (theme) => {
        setAlbumTheme(theme);
        setShowThemeMenu(false);
    };

    const fetchVibeWords = async (vibe) => {
        try {
            console.log('====> fetchVibeWords', vibe);
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
            console.log('====> fetchVibeWords data', data);
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
            const payload = {
                title: createTitle.trim(),
                ...(moodPrompt.trim() && { mood_text: moodPrompt.trim() })
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
        <div className={`word-list-page-container album-content-page albums-page album-theme-${albumTheme}`}>
            <div className="favorites-toolbar">
                <div className="favorites-toolbar-title">Albums</div>
                <div className="favorites-toolbar-actions">
                    <div className="album-theme-menu-container">
                        <button
                            ref={themeToggleButtonRef}
                            className="moods-refresh-icon album-theme-toggle"
                            onClick={handleThemeToggleClick}
                            title={`Theme: ${ALBUM_THEME_LABELS[albumTheme]}. Click to cycle, double-click or double-tap for Themes menu.`}
                            aria-label={`Theme: ${ALBUM_THEME_LABELS[albumTheme]}. Click to cycle, double-click or double-tap for Themes menu.`}
                            aria-haspopup="menu"
                            aria-expanded={showThemeMenu}
                        >
                            <FontAwesomeIcon icon={faPalette} />
                        </button>
                        {showThemeMenu && (
                            <div className="album-theme-menu" ref={themeMenuRef} role="menu" aria-label="Themes">
                                <div className="album-theme-menu-title">Themes</div>
                                {ALBUM_THEMES.map((theme) => (
                                    <button
                                        key={theme}
                                        type="button"
                                        className={`album-theme-menu-item${theme === albumTheme ? ' active' : ''}`}
                                        onClick={() => handleThemeSelect(theme)}
                                        role="menuitemradio"
                                        aria-checked={theme === albumTheme}
                                    >
                                        <span className="album-theme-menu-item-name">{ALBUM_THEME_LABELS[theme]}</span>
                                        <span className="album-theme-menu-item-status">{theme === albumTheme ? 'Current' : ''}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        className="moods-refresh-icon create-album-icon-button"
                        onClick={handleCreateAlbumClick}
                        title="Create Album"
                        aria-label="Create Album"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
            </div>

            <div className="albums-container">
                {loading ? null : albums.length === 0 ? (
                    <div className="empty-state">No albums yet. Create one from a mood!</div>
                ) : (
                    <>
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
                                                        className="album-menu-item"
                                                        onClick={(e) => handleExportClick(e, album)}
                                                    >
                                                        Export
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
                                Update
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
