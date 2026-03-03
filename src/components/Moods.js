import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordScroller from './WordScroller';

function randomizeWords(array) {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

function Moods(props) {
	const [moods, setMoods] = useState([]);
	const [selectedMoodSlug, setSelectedMoodSlug] = useState(null);
	const [selectedMoodLabel, setSelectedMoodLabel] = useState(null);
	const [moodWords, setMoodWords] = useState([]);
	const [loading, setLoading] = useState(false);
	const [customMood, setCustomMood] = useState('');
	const [isCustomVibe, setIsCustomVibe] = useState(false);

	// Fetch moods on component mount
	useEffect(() => {
		fetchMoods();
	}, []);

	// Check if there's a slug in the URL on initial load
	useEffect(() => {
		const slug = props.match.params.slug;
		if (slug) {
			setSelectedMoodSlug(slug);
			// Check if this is a predefined mood or custom vibe
			const isPredefinedMood = moods.some(m => m.slug === slug);
			setIsCustomVibe(!isPredefinedMood);
		} else {
			// Clear selection if no slug in URL
			setSelectedMoodSlug(null);
			setSelectedMoodLabel(null);
			setMoodWords([]);
			setIsCustomVibe(false);
		}
	}, [props.match.params.slug, moods]);

	// Fetch words when mood is selected
	useEffect(() => {
		if (selectedMoodSlug) {
			if (isCustomVibe) {
				fetchVibeWords(selectedMoodSlug);
			} else {
				fetchMoodWords(selectedMoodSlug);
			}
			// Find the label for this slug
			const mood = moods.find(m => m.slug === selectedMoodSlug);
			if (mood) {
				setSelectedMoodLabel(mood.label);
			}
		}
	}, [selectedMoodSlug, moods, isCustomVibe]);

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
				const randomizedWords = randomizeWords(data);
				setMoodWords(randomizedWords);
			}
		} catch (error) {
			console.error('Error fetching mood words:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchVibeWords = async (vibe) => {
		setLoading(true);
		try {
			const response = await fetch('https://wordmage.toews-api.com/words/vibe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					text: vibe,
					limit: 100
				})
			});
			const data = await response.json();
			if (Array.isArray(data)) {
				const randomizedWords = randomizeWords(data);
				setMoodWords(randomizedWords);
			}
		} catch (error) {
			console.error('Error fetching vibe words:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleMoodClick = (slug, label, isVibe = false) => {
		props.history.push(`/mood/${slug}`);
		setSelectedMoodSlug(slug);
		setSelectedMoodLabel(label);
		setIsCustomVibe(isVibe);
	};

	const handleBackToMoods = () => {
		props.history.push('/moods');
		setSelectedMoodSlug(null);
		setSelectedMoodLabel(null);
		setMoodWords([]);
		setIsCustomVibe(false);
	};

	const handleRefresh = () => {
		if (selectedMoodSlug) {
			// Refresh the words for the current mood or vibe
			if (isCustomVibe) {
				fetchVibeWords(selectedMoodSlug);
			} else {
				fetchMoodWords(selectedMoodSlug);
			}
		} else {
			// Refresh the moods list
			fetchMoods();
		}
	};

	const handleCustomMoodSubmit = (e) => {
		e.preventDefault();
		if (customMood.trim()) {
			const slug = customMood.trim().toLowerCase().replace(/\s+/g, '-');
			handleMoodClick(slug, customMood.trim(), true); // true indicates it's a custom vibe
			setCustomMood('');
		}
	};

	return (
		<div className="spotlight-list-container favorites-page">
			<div className="favorites-toolbar">
				<div className="favorites-toolbar-title">
					{selectedMoodLabel ? selectedMoodLabel : 'Moods'}
				</div>
				{selectedMoodSlug && (
					<div className="moods-toolbar-actions">
						<button
							className="mood-back-button"
							onClick={handleBackToMoods}
							title="Back to Moods"
						>
							← Back
						</button>
						<button className="moods-refresh-icon" onClick={handleRefresh} aria-label="Refresh moods">
							<i className="glyphicon glyphicon-repeat"></i>
						</button>
					</div>
				)}
			</div>

			{!selectedMoodSlug ? (
				<>
					<div className="custom-mood-section">
						<form onSubmit={handleCustomMoodSubmit} className="custom-mood-form">
							<input
								type="text"
								value={customMood}
								onChange={(e) => setCustomMood(e.target.value)}
								placeholder="Enter a custom mood..."
								className="custom-mood-input"
							/>
							<button 
								type="submit" 
								className="custom-mood-submit"
								disabled={!customMood.trim()}
							>
								Go
							</button>
						</form>
					</div>
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
				</>
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
