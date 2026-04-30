import { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faRotate, faCircleInfo, faPencil, faCopy } from '@fortawesome/free-solid-svg-icons';
import WordScroller from './WordScroller';
import { CONFIG } from '../config';

function WordAlbum(props) {
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAlbumInfo, setShowAlbumInfo] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedMoodText, setEditedMoodText] = useState('');
    const [originalMoodText, setOriginalMoodText] = useState('');
    const [savingMood, setSavingMood] = useState(false);
    const [copyToast, setCopyToast] = useState(false);
    const albumId = props.match.params.id;
    const panelRef = useRef(null);
    const dragState = useRef(null);

    useEffect(() => {
        if (albumId) {
            fetchAlbum();
            setShowAlbumInfo(false);
            setEditMode(false);
        }
    }, [albumId]);

    const fetchAlbum = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${CONFIG.domain}/albums/${albumId}`);
            const data = await response.json();

            // Sort words: random for Favorites, alphabetically for Learn
            if (data.words && data.title === 'Favorites') {
                data.words.sort(() => Math.random() - 0.5);
            } else if (data.words && data.title === 'Learn') {
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

            await fetchAlbum();
        } catch (error) {
            console.error('Error refreshing mood words:', error);
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

    const wordListVersion = album?.words?.map(word => word.id || word.word).join('|') || 'empty';

    return (
        <div className="word-list-page-container favorites-page">
            <div className="favorites-toolbar">
                <div className="favorites-toolbar-content">
                    <div className="favorites-toolbar-title">
                        Word Album
                    </div>
                    {album?.title && (
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
                        key={`album-${albumId}-${wordListVersion}`}
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

            <div
                className={`album-info-overlay ${showAlbumInfo ? 'open' : ''}`}
                onClick={() => setShowAlbumInfo(false)}
                aria-hidden={!showAlbumInfo}
            />

            {copyToast && (
                <div className="album-mood-copy-toast">Copied!</div>
            )}

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
