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

    const randomizeWords = (words) => {
        const shuffled = [...words];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, 35);
    };

    const handleRefreshMoodWords = async () => {
        if (!album?.mood_text) return;

        setLoading(true);
        try {
            // Get locked word IDs to exclude from new word generation
            const excludeWordIds = album.words
                .filter(word => word.is_locked)
                .map(word => word.id);

            const response = await fetch(`${CONFIG.domain}/custom-mood`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mood_text: album.mood_text,
                    exclude_word_ids: excludeWordIds
                })
            });
            const data = await response.json();

            if (Array.isArray(data)) {
                // Get locked words with their positions from current album
                const lockedWords = album.words
                    .map((word, index) => ({ word, index }))
                    .filter(item => item.word.is_locked);

                // Randomize new words
                const newWords = randomizeWords(data);

                // Build final word list by inserting locked words at their original positions
                const finalWords = [];
                let newWordIndex = 0;

                // Calculate the maximum position we need to handle
                const maxPosition = Math.max(
                    lockedWords.length > 0 ? Math.max(...lockedWords.map(lw => lw.index)) : -1,
                    newWords.length - 1
                );

                for (let i = 0; i <= maxPosition + lockedWords.length; i++) {
                    // Check if there's a locked word at this position
                    const lockedWord = lockedWords.find(lw => lw.index === i);

                    if (lockedWord) {
                        // Insert locked word at its original position
                        finalWords.push(lockedWord.word);
                    } else if (newWordIndex < newWords.length) {
                        // Insert next new word
                        finalWords.push(newWords[newWordIndex]);
                        newWordIndex++;
                    }
                }

                // Map to simplified format for API: { id, is_locked, position }
                const wordsPayload = finalWords.map((word, index) => ({
                    id: word.id,
                    is_locked: word.is_locked || false,
                    position: index
                }));

                // Update album words on server
                await fetch(`${CONFIG.domain}/albums/${albumId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: album.title,
                        mood_text: album.mood_text,
                        words: wordsPayload
                    })
                });

                // Refresh the album
                fetchAlbum();
            }
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
