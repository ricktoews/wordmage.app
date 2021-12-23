import { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import WordItem from './WordItem';
import WordsInterface from '../utils/words-interface';
import WordScroller from './WordScroller';

function Random(props) {
	const [randomWords, setRandomWords] = useState([]);
	const [refresh, setRefresh] = useState(true);
	const [updatePageToggle, setUpdatePageToggle] = useState(true);

	useEffect(() => {
		if (refresh) {
			setRefresh(false);
			var randomPool = WordsInterface.getRandomPool();
			setRandomWords(randomPool);
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
	<div className="browse-container">
	  <div className="browse">
		<p>A random selection from the Browse list.</p>
	    <div className="browse-filter-buttons">
	      <button className={'badge badge-refresh'} onClick={handleNewRandom}><i className="glyphicon glyphicon-repeat"></i> Refresh</button>
	    </div>
	  </div>

	  <WordScroller pool={randomWords} startingNdx={0} />
	</div>
	) : null;
}

export default withRouter(Random);
