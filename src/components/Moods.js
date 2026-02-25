import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordScroller from './WordScroller';

function sortWords(a, b) {
	return a.word < b.word ? -1 : 1;
}

function Moods(props) {
	const [moods, setMoods] = useState([]);
	const [selectedMoodSlug, setSelectedMoodSlug] = useState(null);
	const [selectedMoodLabel, setSelectedMoodLabel] = useState(null);
	const [moodWords, setMoodWords] = useState([]);
	const [loading, setLoading] = useState(false);

	// Fetch moods on component mount
	useEffect(() => {
		fetchMoods();
	}, []);

	// Check if there's a slug in the URL on initial load
	useEffect(() => {
		const slug = props.match.params.slug;
		if (slug) {
			setSelectedMoodSlug(slug);
		} else {
			// Clear selection if no slug in URL
			setSelectedMoodSlug(null);
			setSelectedMoodLabel(null);
			setMoodWords([]);
		}
	}, [props.match.params.slug]);

	// Fetch words when mood is selected
	useEffect(() => {
		if (selectedMoodSlug) {
			fetchMoodWords(selectedMoodSlug);
			// Find the label for this slug
			const mood = moods.find(m => m.slug === selectedMoodSlug);
			if (mood) {
				setSelectedMoodLabel(mood.label);
			}
		}
	}, [selectedMoodSlug, moods]);

	const fetchMoods = async () => {
		try {
			const response = await fetch('https://wordmage.toews-api.com/moods');
			const data = await response.json();
			if (Array.isArray(data)) {
				setMoods(data);
			}
		} catch (error) {
			console.error('Error fetching moods:', error);
		}
	};

	const fetchMoodWords = async (slug) => {
		setLoading(true);
		try {
			const response = await fetch(`https://wordmage.toews-api.com/words/mood/${slug}`);
			const data = await response.json();
			if (Array.isArray(data)) {
				const sortedWords = data.sort(sortWords);
				setMoodWords(sortedWords);
			}
		} catch (error) {
			console.error('Error fetching mood words:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleMoodClick = (slug, label) => {
		props.history.push(`/mood/${slug}`);
		setSelectedMoodSlug(slug);
		setSelectedMoodLabel(label);
	};

	const handleBackToMoods = () => {
		props.history.push('/moods');
		setSelectedMoodSlug(null);
		setSelectedMoodLabel(null);
		setMoodWords([]);
	};

	return (
		<div className="spotlight-list-container favorites-page">
			<div className="favorites-toolbar">
				<div className="favorites-toolbar-title">
					{selectedMoodLabel ? selectedMoodLabel : 'Moods'}
				</div>
				{selectedMoodSlug && (
					<button
						className="mood-back-button"
						onClick={handleBackToMoods}
						title="Back to Moods"
					>
						← Back
					</button>
				)}
			</div>

			{!selectedMoodSlug ? (
				<div className="moods-grid">
					{moods.map((mood) => (
						<button
							key={mood.slug}
							className="mood-button"
							onClick={() => handleMoodClick(mood.slug, mood.label)}
						>
							{mood.label}
						</button>
					))}
				</div>
			) : (
				<div className="mood-words-container">
					{loading ? (
						<div className="loading">Loading words...</div>
					) : (
						<WordScroller
							pool={moodWords}
							startingNdx={0}
							listType={'browse'}
							popupWordForm={props.popupWordForm}
							toggleSpotlight={props.toggleSpotlight}
							onAIExplain={props.onAIExplain}
						/>
					)}
				</div>
			)}
		</div>
	);
}

export default withRouter(Moods);
