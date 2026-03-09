import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
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
	const [showAlbumTitlePopup, setShowAlbumTitlePopup] = useState(false);
	const [albumTitle, setAlbumTitle] = useState('');
	const [showSuccessNotification, setShowSuccessNotification] = useState(false);
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

	const handleSaveAlbum = () => {
		if (!selectedMoodLabel || !isCustomVibe || moodWords.length === 0) {
			return;
		}
		setAlbumTitle(selectedMoodLabel);
		setShowAlbumTitlePopup(true);
	};

	const handleAlbumTitleSubmit = async () => {
		if (!albumTitle.trim()) {
			return;
		}

		try {
			const wordIds = moodWords.map(word => word.id).filter(id => id != null);

			const payload = {
				title: albumTitle.trim(),
				mood_text: selectedMoodLabel,
				word_ids: wordIds
			};

			const response = await fetch(`${CONFIG.domain}/albums`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			if (response.ok) {
				const result = await response.json();
				console.log('Album saved successfully:', result);
				setShowAlbumTitlePopup(false);
				setAlbumTitle('');

				// Show success notification
				setShowSuccessNotification(true);
				setTimeout(() => {
					setShowSuccessNotification(false);
				}, 2000);
			} else {
				console.error('Failed to save album:', response.status);
				alert('Failed to save album. Please try again.');
			}
		} catch (error) {
			console.error('Error saving album:', error);
			alert('Error saving album. Please try again.');
		}
	};

	return (
		<div className="spotlight-list-container favorites-page">
			<div className="favorites-toolbar">
				<div className={selectedMoodSlug ? "favorites-toolbar-title mood-text-title" : "favorites-toolbar-title"}>
					{selectedMoodSlug ? selectedMoodLabel : 'Moods'}
				</div>
				{selectedMoodSlug && (
					<div className="moods-toolbar-actions">
						<button
							className="moods-refresh-icon"
							onClick={handleBackToMoods}
							title="Back to Moods"
							aria-label="Back to Moods"
						>
							<i className="glyphicon glyphicon-chevron-left"></i>
						</button>
						<button className="moods-refresh-icon" onClick={handleRefresh} aria-label="Refresh moods">
							<i className="glyphicon glyphicon-repeat"></i>
						</button>
						<button className="moods-refresh-icon" onClick={handleSaveAlbum} title="Save Album" aria-label="Save Album">
							<i className="glyphicon glyphicon-folder-open"></i>
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

						{customMoods.length > 0 && (
							<div className="custom-moods-list">
								{customMoods.map((moodObj) => (
									<div key={moodObj.id} className="custom-mood-item">
										<button
											className="mood-button custom-mood-button"
											onClick={() => handleMoodClick(
												moodObj.text.toLowerCase().replace(/\s+/g, '-'),
												moodObj.text,
												true
											)}
										>
											{moodObj.text}
										</button>
										<div className="custom-mood-menu-container">
											<button
												className="custom-mood-kebab-menu"
												onClick={(e) => handleCustomMoodMenuClick(e, moodObj.id)}
												aria-label="Mood options"
											>
												<i className="glyphicon glyphicon-option-vertical"></i>
											</button>
											{openCustomMoodMenuId === moodObj.id && (
												<div className="custom-mood-menu-dropdown">
													<div
														className="custom-mood-menu-item"
														onClick={(e) => handleEditMoodClick(e, moodObj)}
													>
														Edit
													</div>
													<div
														className="custom-mood-menu-item custom-mood-menu-item-delete"
														onClick={(e) => handleDeleteMoodClick(e, moodObj)}
													>
														Delete
													</div>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						)}
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

			{showSuccessNotification && (
				<div className="success-notification">
					Album created successfully!
				</div>
			)}

			<Popup isVisible={showAlbumTitlePopup} handleBackgroundClick={() => setShowAlbumTitlePopup(false)}>
				<div className="popup-header">
					<h2>Create Album</h2>
					<div className="close-icon" onClick={() => setShowAlbumTitlePopup(false)}>
						<i className="glyphicon glyphicon-remove"></i>
					</div>
				</div>
				<div className="popup-body">
					<form onSubmit={(e) => { e.preventDefault(); handleAlbumTitleSubmit(); }}>
						<div className="form-group">
							<label htmlFor="album-title">Album Title</label>
							<input
								id="album-title"
								type="text"
								className="form-control"
								value={albumTitle}
								onChange={(e) => setAlbumTitle(e.target.value.slice(0, 35))}
								maxLength={35}
								placeholder="Enter album title (max 35 characters)"
								autoFocus
							/>
							<div className="character-count">{albumTitle.length}/35</div>
						</div>
						<div className="button-wrapper">
							<button type="button" className="btn btn-default" onClick={() => setShowAlbumTitlePopup(false)}>
								Cancel
							</button>
							<button type="submit" className="btn btn-primary" disabled={!albumTitle.trim()}>
								Create Album
							</button>
						</div>
					</form>
				</div>
			</Popup>

			<Popup isVisible={showDeleteMoodPopup} handleBackgroundClick={() => setShowDeleteMoodPopup(false)}>
				<div className="popup-header">
					<h2>Delete Mood</h2>
					<div className="close-icon" onClick={() => setShowDeleteMoodPopup(false)}>
						<i className="glyphicon glyphicon-remove"></i>
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
