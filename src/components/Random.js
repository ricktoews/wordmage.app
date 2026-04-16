import { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate } from '@fortawesome/free-solid-svg-icons';
import { getRandomPageData } from '../utils/api';
import WordScroller from './WordScroller';

function Random(props) {
	const [randomWords, setRandomWords] = useState([]);
	const [featuredWord, setFeaturedWord] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const loadRandomData = async () => {
		setIsLoading(true);
		try {
			const userId = localStorage.getItem('wordmage-profile-user_id');
			const data = await getRandomPageData(userId);

			setRandomWords(data.words || []);
			setFeaturedWord(data.featured_favorite || null);
		} catch (error) {
			console.error('Error loading random page data:', error);
			setRandomWords([]);
			setFeaturedWord(null);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadRandomData();
	}, []);

	const handleNewRandom = () => {
		console.log('Refresh random list.');
		loadRandomData();
	};

	return (
		<div className="browse-container random-page">
			<div className="random-toolbar">
				<div className="random-toolbar-title">Random</div>
				<button className="random-refresh-icon" onClick={handleNewRandom} aria-label="Refresh random words" disabled={isLoading}>
					<FontAwesomeIcon icon={faRotate} spin={isLoading} />
				</button>
			</div>

			{featuredWord && (
				<div className="random-featured-card">
					<div className="random-featured-header">
						<div className="random-featured-label">FEATURED FAVORITE WORD</div>
					</div>
					<div className="random-featured-content">
						<div className="word-item-word-container">
							<span className="featured-word-dot">•</span>
							<div className="word-item-word">{featuredWord.word}</div>
						</div>
						<div className="word-item-def-container">
							<div className="word-item-def">{featuredWord.def || featuredWord.definition}</div>
						</div>
					</div>
				</div>
			)}

			{randomWords.length > 0 && (
				<WordScroller pool={randomWords} listType={'random'} popupWordForm={props.popupWordForm} startingNdx={0} onAIExplain={props.onAIExplain} />
			)}

			{isLoading && randomWords.length === 0 && (
				<div className="loading-message">Loading random words...</div>
			)}
		</div>
	);
}

export default withRouter(Random);
