import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faChevronLeft,
	faRotate,
	faXmark
} from '@fortawesome/free-solid-svg-icons';
import WordScroller from './WordScroller';
import DataSource from '../utils/data-source';
import { CONFIG } from '../config';
import Popup from './Popup';

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
	const [customMoods, setCustomMoods] = useState([]);
	const [selectedMoodSlug, setSelectedMoodSlug] = useState(null);
	const [selectedMoodLabel, setSelectedMoodLabel] = useState(null);
	const [moodWords, setMoodWords] = useState([]);
	const [loading, setLoading] = useState(false);
	const [customMood, setCustomMood] = useState('');
	const [isCustomVibe, setIsCustomVibe] = useState(false);
	const [openCustomMoodMenuId, setOpenCustomMoodMenuId] = useState(null);
	const [showDeleteMoodPopup, setShowDeleteMoodPopup] = useState(false);
	const [selectedCustomMood, setSelectedCustomMood] = useState(null);
	const [isEditingMood, setIsEditingMood] = useState(false);

	// Fetch moods on component mount
	useEffect(() => {
		fetchMoods();
		loadCustomMoods();
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
				// Use the label (original text) for custom vibes
				fetchVibeWords(selectedMoodLabel);
			} else {
				fetchMoodWords(selectedMoodSlug);
			}
			// Find the label for this slug
			const mood = moods.find(m => m.slug === selectedMoodSlug);
			if (mood) {
				setSelectedMoodLabel(mood.label);
			}
		}
	}, [selectedMoodSlug, selectedMoodLabel, moods, isCustomVibe]);

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

	const loadCustomMoods = () => {
		const savedMoods = DataSource.retrieveMoods();
		setCustomMoods(savedMoods);
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
			const response = await fetch('https://wordmage.toews-api.com/custom-mood', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					mood_text: vibe
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
				fetchVibeWords(selectedMoodLabel);
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
			if (isEditingMood && selectedCustomMood) {
				// Update existing mood
				handleEditMoodSubmit();
			} else {
				// Save new custom mood
				const updatedMoods = DataSource.saveMood(customMood.trim());
				setCustomMoods(updatedMoods);

				const slug = customMood.trim().toLowerCase().replace(/\s+/g, '-');
				handleMoodClick(slug, customMood.trim(), true); // true indicates it's a custom vibe
				setCustomMood('');
			}
		}
	};

	const handleCustomMoodMenuClick = (e, moodId) => {
		e.stopPropagation();
		setOpenCustomMoodMenuId(openCustomMoodMenuId === moodId ? null : moodId);
	};

	const handleEditMoodClick = (e, moodObj) => {
		e.stopPropagation();
		setSelectedCustomMood(moodObj);
		setCustomMood(moodObj.text);
		setIsEditingMood(true);
		setOpenCustomMoodMenuId(null);
	};

	const handleEditMoodSubmit = async () => {
		if (!customMood.trim() || !selectedCustomMood) {
			return;
		}

		try {
			const response = await fetch(`${CONFIG.domain}/custom-moods/${selectedCustomMood.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ mood_text: customMood.trim() })
			});

			if (response.ok) {
				// Update local storage
				const moods = DataSource.retrieveMoods();
				const updatedMoods = moods.map(m =>
					m.id === selectedCustomMood.id ? { ...m, text: customMood.trim() } : m
				);
				localStorage.setItem('my-moods', JSON.stringify(updatedMoods));
				setCustomMoods(updatedMoods);
				setCustomMood('');
				setIsEditingMood(false);
				setSelectedCustomMood(null);
			} else {
				alert('Failed to update mood. Please try again.');
			}
		} catch (error) {
			console.error('Error updating mood:', error);
			alert('Error updating mood. Please try again.');
		}
	};

	const handleDeleteMoodClick = (e, moodObj) => {
		e.stopPropagation();
		setSelectedCustomMood(moodObj);
		setShowDeleteMoodPopup(true);
		setOpenCustomMoodMenuId(null);
	};

	const handleDeleteMoodConfirm = async () => {
		if (!selectedCustomMood) {
			return;
		}

		try {
			const response = await fetch(`${CONFIG.domain}/custom-moods/${selectedCustomMood.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				// Update local storage
				const moods = DataSource.retrieveMoods();
				const updatedMoods = moods.filter(m => m.id !== selectedCustomMood.id);
				localStorage.setItem('my-moods', JSON.stringify(updatedMoods));
				setCustomMoods(updatedMoods);
				setShowDeleteMoodPopup(false);
				setSelectedCustomMood(null);
			} else {
				alert('Failed to delete mood. Please try again.');
			}
		} catch (error) {
			console.error('Error deleting mood:', error);
			alert('Error deleting mood. Please try again.');
		}
	};

	return (
		<div className="word-list-page-container favorites-page">
			<div className="favorites-toolbar">
				<div className={selectedMoodSlug ? "favorites-toolbar-title mood-text-title" : "favorites-toolbar-title"}>
					{selectedMoodSlug ? selectedMoodLabel : 'Moods'}
				</div>
				{selectedMoodSlug && (
					<div className="moods-toolbar-actions">
						<button className="moods-refresh-icon" onClick={handleRefresh} aria-label="Refresh moods">
							<FontAwesomeIcon icon={faRotate} />
						</button>
						<button
							className="moods-refresh-icon"
							onClick={handleBackToMoods}
							title="Back to Moods"
							aria-label="Back to Moods"
						>
							<FontAwesomeIcon icon={faChevronLeft} />
						</button>
					</div>
				)}
			</div>

			{!selectedMoodSlug ? (
				<>
					<div className="moods-grid">
						{moods.map((mood) => (
							<button
								key={mood.slug}
								className="mood-button"
								onClick={() => handleMoodClick(mood.slug, mood.label, false)}
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
							onAIExplain={props.onAIExplain}
						/>
					)}
				</div>
			)}

			<Popup isVisible={showDeleteMoodPopup} handleBackgroundClick={() => setShowDeleteMoodPopup(false)}>
				<div className="popup-header">
					<h2>Delete Mood</h2>
					<div className="close-icon" onClick={() => setShowDeleteMoodPopup(false)}>
						<FontAwesomeIcon icon={faXmark} />
					</div>
				</div>
				<div className="popup-body">
					<p>This cannot be undone. Are you sure?</p>
					<div className="button-wrapper">
						<button className="btn btn-default" onClick={() => setShowDeleteMoodPopup(false)}>
							Cancel
						</button>
						<button className="btn btn-primary" onClick={handleDeleteMoodConfirm}>
							Delete
						</button>
					</div>
				</div>
			</Popup>
		</div>
	);
}

export default withRouter(Moods);
