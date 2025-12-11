import { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';
import WordScroller from './WordScroller';

function Random(props) {
	const [randomWords, setRandomWords] = useState([]);
	const [refresh, setRefresh] = useState(true);
	const [updatePageToggle, setUpdatePageToggle] = useState(true);
	const [featuredWord, setFeaturedWord] = useState(null);

	useEffect(() => {
		if (refresh) {
			setRefresh(false);
			var randomPool = WordsInterface.getRandomPool();
			setRandomWords(randomPool);
			
			// Select a random word from spotlight/liked list if there are more than 5 items
			const spotlightWords = WordsInterface.getWordList('spotlight');
			if (spotlightWords.length > 5) {
				const randomIndex = Math.floor(Math.random() * spotlightWords.length);
				setFeaturedWord(spotlightWords[randomIndex]);
			} else {
				setFeaturedWord(null);
			}
		}
	});

	const handleNewRandom = word => {
		console.log('Refresh random list.');
		setRefresh(true);
	}

	const toggleSpotlight = word => {
		props.toggleSpotlight(word);
		setUpdatePageToggle(!updatePageToggle);
	}

	return randomWords.length > 0 ? (
	<div className="browse-container random-page">
	  <div className="random-toolbar">
	    <div className="random-toolbar-title">Random</div>
	    <button className="random-refresh-icon" onClick={handleNewRandom} aria-label="Refresh random words">
	      <i className="glyphicon glyphicon-repeat"></i>
	    </button>
	  </div>

	  {featuredWord && (
	    <div className="random-featured-card">
	      <div className="random-featured-header">
	        <div className="random-featured-label">FEATURED FAVORITE WORD</div>
	      </div>
	      <div className="random-featured-content">
	        <div className="word-item-word-container">
	          <span className="featured-word-dot">●</span>
	          <div className="word-item-word">{featuredWord.word}</div>
	        </div>
	        <div className="word-item-def-container">
	          <div className="word-item-def">{featuredWord.def}</div>
	        </div>
	      </div>
	    </div>
	  )}

	  <WordScroller pool={randomWords} popupWordForm={props.popupWordForm} startingNdx={0} />
	</div>
	) : null;
}

export default withRouter(Random);
