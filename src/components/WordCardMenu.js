import { useState, useRef, useEffect } from 'react';
import WordsInterface from '../utils/words-interface';

function WordCardMenu(props) {
    const { wordObj, listType, popupTags } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(wordObj.spotlight);
    const [isLearning, setIsLearning] = useState(wordObj.learn);
    const [isDiscarded, setIsDiscarded] = useState(wordObj.dislike);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleMenu = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleBookmark = (e) => {
        e.stopPropagation();
        setIsBookmarked(!isBookmarked);
        WordsInterface.toggleSpotlight(wordObj.word);
        setIsOpen(false);
        // Force parent to re-render
        if (props.onUpdate) props.onUpdate();
    };

    const handleLearn = (e) => {
        e.stopPropagation();
        setIsLearning(!isLearning);
        WordsInterface.toggleLearn(wordObj.word);
        setIsOpen(false);
        // Force parent to re-render
        if (props.onUpdate) props.onUpdate();
    };

    const handleDiscard = (e) => {
        e.stopPropagation();
        setIsDiscarded(!isDiscarded);
        WordsInterface.toggleDislike(wordObj.word);
        setIsOpen(false);
        if (props.onUpdate) props.onUpdate();
    };

    const handleTag = (e) => {
        e.stopPropagation();
        setIsOpen(false);
        popupTags(wordObj, e.target);
    };

    return (
        <div className="word-card-menu" ref={menuRef}>
            <button 
                className="word-card-menu-button" 
                onClick={toggleMenu}
                aria-label="Word options"
            >
                <i className="glyphicon glyphicon-option-vertical"></i>
            </button>
            
            {isOpen && (
                <div className="word-card-menu-dropdown">
                    <button 
                        className="word-card-menu-item"
                        onClick={handleBookmark}
                    >
                        <i className={`glyphicon glyphicon-thumbs-${isBookmarked ? 'down' : 'up'}`}></i>
                        <span>{isBookmarked ? 'Remove Favorite' : 'Favorite word'}</span>
                    </button>
                    
                    <button 
                        className="word-card-menu-item"
                        onClick={handleLearn}
                    >
                        <i className="glyphicon glyphicon-leaf"></i>
                        <span>{isLearning ? 'Remove from Learn' : 'Learn word'}</span>
                    </button>
                    
                    <button 
                        className="word-card-menu-item"
                        onClick={handleDiscard}
                    >
                        <i className="glyphicon glyphicon-trash"></i>
                        <span>{isDiscarded ? 'Restore' : 'Discard'}</span>
                    </button>
                    
                    <button 
                        className="word-card-menu-item"
                        onClick={handleTag}
                    >
                        <i className="glyphicon glyphicon-tag"></i>
                        <span>Tag</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default WordCardMenu;
