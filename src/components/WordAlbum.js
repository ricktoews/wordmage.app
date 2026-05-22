import { useEffect, useMemo, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate, faRotateLeft, faCircleInfo, faPencil, faCopy, faPalette, faPuzzlePiece, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import WordScroller from './WordScroller';
import { CONFIG } from '../config';
import Popup from './Popup';
import PopupListShare from './PopupListShare';

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
const GLOBAL_HEADER_THEME_CLASSES = ALBUM_THEMES.map(theme => `album-theme-global-${theme}`);

function getRefreshUndoStorageKey(albumId) {
    return `wordmage.albumRefreshUndo.${albumId}`;
}

function readRefreshUndoSnapshot(albumId) {
    if (!albumId || typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = window.sessionStorage.getItem(getRefreshUndoStorageKey(albumId));
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed?.words) || parsed.words.length === 0) {
            return null;
        }

        return {
            createdAt: parsed.createdAt || Date.now(),
            words: parsed.words
                .filter((entry) => entry && entry.word_id != null && Number.isFinite(entry.position))
                .map((entry) => ({
                    word_id: String(entry.word_id),
                    position: Number(entry.position),
                })),
        };
    } catch (error) {
        console.error('Failed to read album refresh undo snapshot:', error);
        return null;
    }
}

function writeRefreshUndoSnapshot(albumId, snapshot) {
    if (!albumId || typeof window === 'undefined') {
        return;
    }

    try {
        if (!snapshot?.words?.length) {
            window.sessionStorage.removeItem(getRefreshUndoStorageKey(albumId));
            return;
        }

        window.sessionStorage.setItem(getRefreshUndoStorageKey(albumId), JSON.stringify(snapshot));
    } catch (error) {
        console.error('Failed to write album refresh undo snapshot:', error);
    }
}

function WordAlbum(props) {
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAlbumInfo, setShowAlbumInfo] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedMoodText, setEditedMoodText] = useState('');
    const [originalMoodText, setOriginalMoodText] = useState('');
    const [savingMood, setSavingMood] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [copyToast, setCopyToast] = useState(false);
    const [favoritesSortMode, setFavoritesSortMode] = useState('random');
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const [lastRefreshSnapshot, setLastRefreshSnapshot] = useState(null);
    const [albumTheme, setAlbumTheme] = useState(() => {
        if (typeof window === 'undefined') {
            return 'classic';
        }

        const savedTheme = window.localStorage.getItem('wordmage.albumTheme');
        return ALBUM_THEMES.includes(savedTheme) ? savedTheme : 'classic';
    });
    const albumId = props.match.params.id;
    const panelRef = useRef(null);
    const dragState = useRef(null);
    const themeMenuRef = useRef(null);
    const themeToggleButtonRef = useRef(null);
    const themeClickTimerRef = useRef(null);
    const lastThemeToggleClickRef = useRef(0);

    const THEME_DOUBLE_TAP_MS = 280;

    useEffect(() => {
        window.localStorage.setItem('wordmage.albumTheme', albumTheme);

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('wordmage:albumThemeChanged', {
                detail: { theme: albumTheme }
            }));
        }
    }, [albumTheme]);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return undefined;
        }

        const { body } = document;
        body.classList.add('album-theme-global-active');
        GLOBAL_HEADER_THEME_CLASSES.forEach((themeClass) => body.classList.remove(themeClass));
        body.classList.add(`album-theme-global-${albumTheme}`);

        return () => {
            body.classList.remove('album-theme-global-active');
            GLOBAL_HEADER_THEME_CLASSES.forEach((themeClass) => body.classList.remove(themeClass));
        };
    }, [albumTheme]);

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

    useEffect(() => {
        if (albumId) {
            fetchAlbum();
            setShowAlbumInfo(false);
            setEditMode(false);
            setFavoritesSortMode('random');
            setShowThemeMenu(false);
            setLastRefreshSnapshot(readRefreshUndoSnapshot(albumId));
        }
    }, [albumId]);

    useEffect(() => {
        writeRefreshUndoSnapshot(albumId, lastRefreshSnapshot);
    }, [albumId, lastRefreshSnapshot]);

    useEffect(() => {
        return () => {
            if (themeClickTimerRef.current) {
                clearTimeout(themeClickTimerRef.current);
            }
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


    const handleToUnscramble = () => {
        props.history.push('/unscramble');
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

        const previousWords = (album?.words || [])
            .map((word, index) => {
                const wordId = word.id || word._id;
                if (!wordId) return null;

                return {
                    word_id: String(wordId),
                    position: typeof word.position === 'number' ? word.position : (index + 1),
                };
            })
            .filter(Boolean);

        setLoading(true);
        try {
            const response = await fetch(`${CONFIG.domain}/albums/${albumId}/refresh`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error(`Failed to refresh album: ${response.status}`);
            }

            await fetchAlbum();
            const nextSnapshot = {
                words: previousWords,
                createdAt: Date.now(),
            };
            setLastRefreshSnapshot(nextSnapshot);
        } catch (error) {
            console.error('Error refreshing mood words:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUndoMoodRefresh = async () => {
        if (!albumId || !lastRefreshSnapshot?.words?.length) return;

        const restoreWords = lastRefreshSnapshot.words;

        setLoading(true);
        try {
            const restoreResponse = await fetch(`${CONFIG.domain}/albums/${albumId}/words`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    words: restoreWords.map((entry) => ({
                        word_id: entry.word_id,
                        position: entry.position,
                    })),
                }),
            });

            if (!restoreResponse.ok) {
                throw new Error(`Failed restoring album words: ${restoreResponse.status}`);
            }

            const restoredAlbum = await restoreResponse.json().catch(() => null);

            if (restoredAlbum?.words && Array.isArray(restoredAlbum.words)) {
                setAlbum((prevAlbum) => ({
                    ...prevAlbum,
                    ...restoredAlbum,
                }));
            } else {
                await fetchAlbum();
            }

            setLastRefreshSnapshot(null);
        } catch (error) {
            console.error('Error undoing mood refresh:', error);
            alert('Failed to undo refresh. Ensure the server supports PUT /albums/:id/words with a words array of { word_id, position } objects.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditMood = () => {
        setOriginalMoodText(album?.mood_text || '');
        setEditedMoodText(album?.mood_text || '');
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditedMoodText('');
        setOriginalMoodText('');
    };

    const handleCopyMood = async () => {
        const textToCopy = album?.mood_text || '';
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopyToast(true);
            setTimeout(() => setCopyToast(false), 2000);
        } catch (error) {
            console.error('Failed to copy mood text:', error);
        }
    };

    const handleSaveMood = async () => {
        const trimmedText = editedMoodText.trim();

        console.log('Save mood — albumId:', albumId, '| description:', trimmedText);

        if (!trimmedText) {
            console.warn('Cannot save empty mood text');
            return;
        }

        setSavingMood(true);
        try {
            const response = await fetch(`${CONFIG.domain}/albums/${albumId}/mood-text`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mood_text: trimmedText }),
            });

            if (!response.ok) {
                throw new Error(`Failed to save mood: ${response.status}`);
            }

            await fetchAlbum();
            setEditMode(false);
            setEditedMoodText('');
            setOriginalMoodText('');
        } catch (error) {
            console.error('Error saving mood text:', error);
            alert('Failed to save mood text. Please try again.');
        } finally {
            setSavingMood(false);
        }
    };

    const handleDragHandleTouchStart = (e) => {
        const panel = panelRef.current;
        if (!panel) return;
        panel.style.transition = 'none';
        const y = e.touches[0].clientY;
        dragState.current = { startY: y, currentY: y };

        const onMove = (ev) => {
            if (!dragState.current) return;
            ev.preventDefault();
            const my = ev.touches[0].clientY;
            const delta = Math.max(0, my - dragState.current.startY);
            dragState.current.currentY = my;
            panel.style.transform = `translateY(${delta}px)`;
        };

        const onEnd = () => {
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            document.removeEventListener('touchcancel', onEnd);
            if (!dragState.current) return;
            const delta = dragState.current.currentY - dragState.current.startY;
            dragState.current = null;
            panel.style.transition = '';
            panel.style.transform = '';
            if (delta > 60) {
                setShowAlbumInfo(false);
            }
        };

        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
        document.addEventListener('touchcancel', onEnd);
    };

    const isFavoritesAlbum = album?.title === 'Favorites';

    const displayedWords = useMemo(() => {
        if (!album?.words) return [];

        if (isFavoritesAlbum) {
            const words = [...album.words];

            if (favoritesSortMode === 'alphabetical') {
                return words.sort((a, b) => a.word.localeCompare(b.word));
            }

            for (let i = words.length - 1; i > 0; i -= 1) {
                const j = Math.floor(Math.random() * (i + 1));
                [words[i], words[j]] = [words[j], words[i]];
            }
            return words;
        }

        return album.words;
    }, [album?.words, favoritesSortMode, isFavoritesAlbum]);

    const wordListVersion = displayedWords.map(word => word.id || word.word).join('|') || 'empty';

    const handleShare = () => {
        setShowSharePopup(true);
    };

    return (
        <div className={`word-list-page-container album-content-page album-theme-${albumTheme}${(!isFavoritesAlbum && album?.title) ? ' album-has-subtitle' : ''}`}>
            <div className="favorites-toolbar">
                <div className="favorites-toolbar-content">
                    <div className="favorites-toolbar-title">
                        {isFavoritesAlbum ? 'Favorites' : 'Word Album'}
                    </div>
                    {album?.title && !isFavoritesAlbum && (
                        <div className="album-title-subtitle">
                            <span>{album.title}</span>
                            <button
                                type="button"
                                className="album-title-info-button"
                                onClick={() => setShowAlbumInfo(prev => !prev)}
                                title="Album info"
                                aria-label="Album info"
                            >
                                <FontAwesomeIcon icon={faCircleInfo} className="album-title-info-icon" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="moods-toolbar-actions">
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
                    {isFavoritesAlbum && (
                        <button
                            className="moods-refresh-icon"
                            onClick={handleToUnscramble}
                            title="Unscramble"
                            aria-label="Unscramble"
                        >
                            <FontAwesomeIcon icon={faPuzzlePiece} />
                        </button>
                    )}
                    <button
                        type="button"
                        className="moods-refresh-icon"
                        onClick={handleShare}
                        title="Share words"
                        aria-label="Share words"
                        disabled={displayedWords.length === 0}
                    >
                        <FontAwesomeIcon icon={faShareNodes} />
                    </button>
                    {isFavoritesAlbum && (
                        <button
                            type="button"
                            className="favorites-sort-toggle"
                            onClick={() => setFavoritesSortMode(prev => (prev === 'random' ? 'alphabetical' : 'random'))}
                            title={`Switch to ${favoritesSortMode === 'random' ? 'alphabetical' : 'random'} order`}
                            aria-label={`Switch to ${favoritesSortMode === 'random' ? 'alphabetical' : 'random'} order`}
                        >
                            {favoritesSortMode === 'random' ? 'A-Z' : 'Random'}
                        </button>
                    )}
                    {album?.mood_text && lastRefreshSnapshot?.words?.length > 0 && (
                        <button
                            className="moods-refresh-icon"
                            onClick={handleUndoMoodRefresh}
                            title="Undo last refresh"
                            aria-label="Undo last refresh"
                            disabled={loading}
                        >
                            <FontAwesomeIcon icon={faRotateLeft} />
                        </button>
                    )}
                    {album?.mood_text && (
                        <button
                            className="moods-refresh-icon"
                            onClick={handleRefreshMoodWords}
                            title="Refresh mood words"
                            aria-label="Refresh mood words"
                            disabled={loading}
                        >
                            <FontAwesomeIcon icon={faRotate} />
                        </button>
                    )}
                </div>
            </div>

            <div className="album-words-container">
                {loading ? (
                    <div className="loading">Loading album...</div>
                ) : album && album.words ? (
                    <WordScroller
                        key={`album-${albumId}-${wordListVersion}`}
                        pool={displayedWords}
                        startingNdx={0}
                        listType={'album'}
                        albumId={albumId}
                        hasMoodText={!!album.mood_text}
                        onWordLockToggle={handleWordLockToggle}
                        onAlbumRefresh={fetchAlbum}
                        onAIExplain={props.onAIExplain}
                    />
                ) : (
                    <div className="empty-state">Album not found</div>
                )}
            </div>

            <div
                className={`album-info-overlay ${showAlbumInfo ? 'open' : ''}`}
                onClick={() => setShowAlbumInfo(false)}
                aria-hidden={!showAlbumInfo}
            />

            {copyToast && (
                <div className="album-mood-copy-toast">Copied!</div>
            )}

            <Popup isVisible={showSharePopup} handleBackgroundClick={() => setShowSharePopup(false)}>
                <PopupListShare
                    title={isFavoritesAlbum ? 'Share Favorites' : `Share ${album?.title || 'Word Album'}`}
                    label={isFavoritesAlbum ? 'Favorites' : album?.title || 'Word Album'}
                    wordEntries={displayedWords}
                />
            </Popup>

            <div ref={panelRef} className={`album-info-panel ${showAlbumInfo ? 'open' : ''}`}>
                <div
                    className="album-info-drag-handle"
                    onTouchStart={handleDragHandleTouchStart}
                />
                <div className="album-info-panel-header">
                    <div className="album-info-panel-label">Mood</div>
                    {!editMode && album?.mood_text && (
                        <div className="album-info-panel-actions">
                            <button
                                type="button"
                                className="album-info-copy-button"
                                onClick={handleCopyMood}
                                title="Copy mood"
                                aria-label="Copy mood"
                            >
                                <FontAwesomeIcon icon={faCopy} />
                            </button>
                            <button
                                type="button"
                                className="album-info-edit-button"
                                onClick={handleEditMood}
                                title="Edit mood"
                                aria-label="Edit mood"
                            >
                                <FontAwesomeIcon icon={faPencil} />
                            </button>
                        </div>
                    )}
                </div>

                {!editMode ? (
                    <div className="album-info-panel-content">
                        {album?.mood_text || 'No mood text available for this album.'}
                    </div>
                ) : (
                    <div className="album-info-edit-mode">
                        <textarea
                            className="album-mood-textarea"
                            value={editedMoodText}
                            onChange={(e) => setEditedMoodText(e.target.value)}
                            placeholder="Enter mood text..."
                            autoFocus
                            rows={2}
                        />
                        <div className="album-info-button-group">
                            <button
                                type="button"
                                className="album-info-button album-info-button-cancel"
                                onClick={handleCancelEdit}
                                disabled={savingMood}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="album-info-button album-info-button-save"
                                onClick={handleSaveMood}
                                disabled={savingMood || !editedMoodText.trim() || editedMoodText.trim() === originalMoodText.trim()}
                            >
                                {savingMood ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default withRouter(WordAlbum);
