import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEllipsisVertical,
    faThumbsUp,
    faThumbsDown,
    faLeaf,
    faTrash,
    faFolderOpen,
    faFolder,
    faXmark,
    faLock,
    faLockOpen
} from '@fortawesome/free-solid-svg-icons';
import WordsInterface from '../utils/words-interface';
import { CONFIG } from '../config';
import Popup from './Popup';

function WordCardMenu(props) {
    const { wordObj, listType, albumId, onAlbumRefresh, popupAlbums, hasMoodText, onWordLockToggle } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(WordsInterface.isWordLiked(wordObj.word));
    const [isLearning, setIsLearning] = useState(WordsInterface.isWordInLearn(wordObj));
    const [isDiscarded, setIsDiscarded] = useState(wordObj.dislike);
    const [isLocked, setIsLocked] = useState(wordObj.is_locked || false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [menuPosition, setMenuPosition] = useState('bottom');
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        function handleScroll() {
            setIsOpen(false);
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Close menu on scroll
            window.addEventListener('scroll', handleScroll, true);

            // Calculate if menu should open upward or downward
            if (buttonRef.current) {
                const buttonRect = buttonRef.current.getBoundingClientRect();
                const menuHeight = 250; // Approximate height of menu
                const spaceBelow = window.innerHeight - buttonRect.bottom;
                const spaceAbove = buttonRect.top;

                // If not enough space below but more space above, open upward
                if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
                    setMenuPosition('top');
                } else {
                    setMenuPosition('bottom');
                }
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen]);

    const toggleMenu = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleBookmark = async (e) => {
        e.stopPropagation();
        const newBookmarkedState = !isBookmarked;
        setIsOpen(false);

        try {
            const albumIds = WordsInterface.getAlbumIds();
            const favoritesAlbumId = albumIds.Favorites;

            if (!favoritesAlbumId) {
                console.error('Favorites album ID not found');
                alert('Favorites album not configured. Please try again.');
                return;
            }

            if (newBookmarkedState) {
                // Add word to Favorites album
                const response = await fetch(`${CONFIG.domain}/albums/add-word`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        album_id: favoritesAlbumId,
                        word_id: wordObj.id
                    })
                });

                if (response.ok) {
                    setIsBookmarked(true);
                    WordsInterface.addToLiked(wordObj);
                    if (props.onUpdate) props.onUpdate();
                    if (onAlbumRefresh) onAlbumRefresh();
                } else {
                    console.error('Failed to add word to Favorites');
                    alert('Failed to add word to Favorites. Please try again.');
                }
            } else {
                // Remove word from Favorites album
                const response = await fetch(`${CONFIG.domain}/albums/delete-word`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        album_id: favoritesAlbumId,
                        word_id: wordObj.id
                    })
                });

                if (response.ok) {
                    setIsBookmarked(false);
                    WordsInterface.removeFromLiked(wordObj);
                    if (props.onUpdate) props.onUpdate();
                    if (onAlbumRefresh) onAlbumRefresh();
                } else {
                    console.error('Failed to remove word from Favorites');
                    alert('Failed to remove word from Favorites. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Error toggling favorite. Please try again.');
        }
    };

    const handleLearn = async (e) => {
        e.stopPropagation();
        const newLearningState = !isLearning;
        setIsOpen(false);

        try {
            const albumIds = WordsInterface.getAlbumIds();
            const learnAlbumId = albumIds.Learn;

            if (!learnAlbumId) {
                console.error('Learn album ID not found');
                alert('Learn album not configured. Please try again.');
                return;
            }

            if (newLearningState) {
                // Add word to Learn album
                const response = await fetch(`${CONFIG.domain}/albums/add-word`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        album_id: learnAlbumId,
                        word_id: wordObj.id
                    })
                });

                if (response.ok) {
                    setIsLearning(true);
                    WordsInterface.addToLearn(wordObj);
                    if (props.onUpdate) props.onUpdate();
                    if (onAlbumRefresh) onAlbumRefresh();
                } else {
                    console.error('Failed to add word to Learn');
                    alert('Failed to add word to Learn. Please try again.');
                }
            } else {
                // Remove word from Learn album
                const response = await fetch(`${CONFIG.domain}/albums/delete-word`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        album_id: learnAlbumId,
                        word_id: wordObj.id
                    })
                });

                if (response.ok) {
                    setIsLearning(false);
                    WordsInterface.removeFromLearn(wordObj);
                    if (props.onUpdate) props.onUpdate();
                    if (onAlbumRefresh) onAlbumRefresh();
                } else {
                    console.error('Failed to remove word from Learn');
                    alert('Failed to remove word from Learn. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error toggling learn:', error);
            alert('Error toggling learn. Please try again.');
        }
    };

    const handleDiscard = (e) => {
        e.stopPropagation();
        setIsDiscarded(!isDiscarded);
        WordsInterface.toggleDislike(wordObj.word);
        setIsOpen(false);
        if (props.onUpdate) props.onUpdate();
    };

    const handleAddToAlbum = (e) => {
        e.stopPropagation();
        setIsOpen(false);
        popupAlbums(wordObj, e.target);
    };

    const handleRemoveFromAlbum = (e) => {
        e.stopPropagation();
        setIsOpen(false);
        setShowDeletePopup(true);
    };

    const handleToggleLock = async (e) => {
        e.stopPropagation();
        const newLockedState = !isLocked;
        setIsOpen(false);

        try {
            const response = await fetch(`${CONFIG.domain}/albums/${albumId}/words/${wordObj.id}/lock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    is_locked: newLockedState
                })
            });

            if (response.ok) {
                setIsLocked(newLockedState);
                if (onWordLockToggle) {
                    onWordLockToggle(wordObj.id, newLockedState);
                }
            } else {
                console.error('Failed to toggle lock status:', response.status);
                alert('Failed to toggle lock status. Please try again.');
            }
        } catch (error) {
            console.error('Error toggling lock status:', error);
            alert('Error toggling lock status. Please try again.');
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`${CONFIG.domain}/albums/delete-word`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    album_id: albumId,
                    word_id: wordObj.id
                })
            });

            if (response.ok) {
                setShowDeletePopup(false);
                if (onAlbumRefresh) {
                    onAlbumRefresh();
                }
            } else {
                console.error('Failed to remove word from album:', response.status);
                alert('Failed to remove word from album. Please try again.');
            }
        } catch (error) {
            console.error('Error removing word from album:', error);
            alert('Error removing word from album. Please try again.');
        }
    };

    return (
        <div className="word-card-menu" ref={menuRef}>
            <button
                ref={buttonRef}
                className="word-card-menu-button"
                onClick={toggleMenu}
                aria-label="Word options"
            >
                <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>

            {isOpen && (
                <div className={`word-card-menu-dropdown word-card-menu-dropdown-${menuPosition}`}>
                    {listType === 'album' && albumId && hasMoodText && (
                        <button
                            className="word-card-menu-item"
                            onClick={handleToggleLock}
                        >
                            <FontAwesomeIcon icon={isLocked ? faLockOpen : faLock} />
                            <span>{isLocked ? 'Unlock' : 'Lock'}</span>
                        </button>
                    )}

                    <button
                        className="word-card-menu-item"
                        onClick={handleBookmark}
                    >
                        <FontAwesomeIcon icon={isBookmarked ? faThumbsDown : faThumbsUp} />
                        <span>{isBookmarked ? 'Remove Favorite' : 'Favorite word'}</span>
                    </button>

                    <button
                        className="word-card-menu-item"
                        onClick={handleLearn}
                    >
                        <FontAwesomeIcon icon={faLeaf} />
                        <span>{isLearning ? 'Remove from Learn' : 'Learn word'}</span>
                    </button>

                    <button
                        className="word-card-menu-item"
                        onClick={handleAddToAlbum}
                    >
                        <FontAwesomeIcon icon={faFolderOpen} />
                        <span>+ Album</span>
                    </button>

                    {listType === 'album' && albumId && (
                        <button
                            className="word-card-menu-item word-card-menu-item-delete"
                            onClick={handleRemoveFromAlbum}
                        >
                            <FontAwesomeIcon icon={faFolder} />
                            <span>- Album</span>
                        </button>

                    )}

                    <button
                        className="word-card-menu-item"
                        onClick={handleDiscard}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>{isDiscarded ? 'Restore' : 'Discard'}</span>
                    </button>

                </div>
            )}

            {createPortal(
                <Popup isVisible={showDeletePopup} handleBackgroundClick={() => setShowDeletePopup(false)}>
                    <div className="popup-header">
                        <h2>Remove from Album</h2>
                        <div className="close-icon" onClick={() => setShowDeletePopup(false)}>
                            <FontAwesomeIcon icon={faXmark} />
                        </div>
                    </div>
                    <div className="popup-body">
                        <p>Are you sure you want to remove this word from the album?</p>
                        <div className="button-wrapper">
                            <button className="btn btn-default" onClick={() => setShowDeletePopup(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleDeleteConfirm}>
                                Remove
                            </button>
                        </div>
                    </div>
                </Popup>,
                document.body
            )}
        </div>
    );
}

export default WordCardMenu;
