import { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';
import WordScroller from './WordScroller';

function Train(props) {
	const [trainList, setTrainList] = useState([]);
	const [wordToTrain, setWordToTrain] = useState('');
	const [trainingMode, setTrainingMode] = useState(null); // 'usage' or 'spelling' or null
	const [archnemesis, setArchnemesis] = useState('');
	const [examples, setExamples] = useState('');
	const [letterStates, setLetterStates] = useState([]);
	const [usageSentences, setUsageSentences] = useState([]);
	const [isLoadingUsage, setIsLoadingUsage] = useState(false);
	const [usageError, setUsageError] = useState(null);

	useEffect(() => {
		// Load training words from localStorage
		let trainingWords = [];
		try {
			const stored = localStorage.getItem('my-training-room');
			if (stored) {
				trainingWords = JSON.parse(stored);
			}
		} catch (e) {
			console.error('Error loading training room data:', e);
		}
		setTrainList(trainingWords);
	}, []);

	const handleWordInput = (e) => {
		const word = e.target.value;
		setWordToTrain(word);
		// Initialize letter states for spelling mode
		setLetterStates(word.split('').map(() => false));
	};

	const handleArchnemesisInput = (e) => {
		setArchnemesis(e.target.value);
	};

	const handleExamplesInput = (e) => {
		setExamples(e.target.value);
	};

	const toggleLetter = (index) => {
		const newStates = [...letterStates];
		newStates[index] = !newStates[index];
		setLetterStates(newStates);
	};

	const handleSaveSpellingTemplate = () => {
		if (!wordToTrain.trim()) {
			alert('Please enter a word to train');
			return;
		}

		// Build template string with hyphens for toggled letters
		const template = wordToTrain.split('').map((letter, index) => 
			letterStates[index] ? '-' : letter
		).join('');

		const trainingData = {
			word: wordToTrain.trim(),
			train: 'spelling',
			details: template
		};

		// Get existing training room data or create new array
		let trainingRoom = [];
		try {
			const stored = localStorage.getItem('my-training-room');
			if (stored) {
				trainingRoom = JSON.parse(stored);
			}
		} catch (e) {
			console.error('Error reading training room data:', e);
		}

		// Add new entry
		trainingRoom.push(trainingData);

		// Save back to localStorage
		try {
			localStorage.setItem('my-training-room', JSON.stringify(trainingRoom));
			// Update the displayed list immediately
			setTrainList(trainingRoom);
			alert('Spelling template saved successfully!');
			// Clear form
			setWordToTrain('');
			setLetterStates([]);
		} catch (e) {
			console.error('Error saving training room data:', e);
			alert('Failed to save spelling template');
		}
	};

	const generateUsageExamples = async () => {
		if (!wordToTrain.trim()) {
			setUsageError('Please enter a word first');
			return;
		}

		setIsLoadingUsage(true);
		setUsageError(null);
		setUsageSentences([]);

		try {
			const response = await fetch('/.netlify/functions/generate-usage', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					word: wordToTrain.trim(),
					archnemesis: archnemesis.trim() || null
				}),
			});

			const text = await response.text();
			let data;
			
			try {
				data = JSON.parse(text);
			} catch (e) {
				throw new Error(text || 'Invalid response from server');
			}

			if (!response.ok) {
				throw new Error(data.error || 'Failed to generate usage examples');
			}

			setUsageSentences(data.sentences || []);
		} catch (error) {
			console.error('Usage generation error:', error);
			setUsageError(error.message);
		} finally {
			setIsLoadingUsage(false);
		}
	};

	const handleTrainingModeChange = (mode) => {
		setTrainingMode(mode);
		if (mode !== 'usage') {
			setUsageSentences([]);
			setUsageError(null);
		}
	};

	const handleUpdateTrainingMaterial = () => {
		if (!wordToTrain.trim()) {
			alert('Please enter a word to train');
			return;
		}

		if (!examples.trim()) {
			alert('Please enter example sentences');
			return;
		}

		const trainingData = {
			word: wordToTrain.trim(),
			archnemesis: archnemesis.trim() || null,
			train: trainingMode,
			details: examples.trim()
		};

		// Get existing training room data or create new array
		let trainingRoom = [];
		try {
			const stored = localStorage.getItem('my-training-room');
			if (stored) {
				trainingRoom = JSON.parse(stored);
			}
		} catch (e) {
			console.error('Error reading training room data:', e);
		}

		// Add new entry
		trainingRoom.push(trainingData);

		// Save back to localStorage
		try {
			localStorage.setItem('my-training-room', JSON.stringify(trainingRoom));
			// Update the displayed list immediately
			setTrainList(trainingRoom);
			alert('Training material saved successfully!');
			// Clear form
			setWordToTrain('');
			setArchnemesis('');
			setExamples('');
		} catch (e) {
			console.error('Error saving training room data:', e);
			alert('Failed to save training material');
		}
	};

	return (
		<div className="browse-container train-page">
			<div className="train-toolbar">
				<div className="train-toolbar-title">Training Room</div>
			</div>
			<div className="train-input-section">
				<label htmlFor="train-word-input">Word to train</label>
				<input 
					id="train-word-input"
					type="text" 
					autoCapitalize="off" 
					className="train-word-input" 
					value={wordToTrain}
					onChange={handleWordInput} 
					placeholder="Enter word" 
				/>
			</div>
			<div className="train-mode-section">
				<label>How to train</label>
				<div className="train-mode-buttons">
					<button 
						className={`train-mode-pill ${trainingMode === 'usage' ? 'active' : ''}`}
						onClick={() => handleTrainingModeChange('usage')}
					>
						Usage
					</button>
					<button 
						className={`train-mode-pill ${trainingMode === 'spelling' ? 'active' : ''}`}
						onClick={() => handleTrainingModeChange('spelling')}
					>
						Spelling
					</button>
				</div>
			</div>
			{trainingMode === 'usage' && (
				<>
					<div className="train-usage-controls">
						<label htmlFor="archnemesis-input">Archnemesis (opt)</label>
						<input 
							id="archnemesis-input"
							type="text" 
							autoCapitalize="off" 
							className="train-archnemesis-input" 
							value={archnemesis}
							onChange={handleArchnemesisInput} 
							placeholder="Enter optional word" 
						/>
					</div>
<div className="train-examples-section">
<label htmlFor="examples-input">Example(s)</label>
<textarea 
id="examples-input"
className="train-examples-textarea" 
value={examples}
onChange={handleExamplesInput} 
placeholder="Enter example sentences..." 
/>
</div>
<div className="train-update-section">
<button 
className="train-update-btn"
onClick={handleUpdateTrainingMaterial}
>
Update Training Material
</button>
</div>
				</>
			)}
{trainingMode === 'spelling' && (
	<>
		<div className="train-spelling-section">
			<div className="train-spelling-letters">
				{wordToTrain.split('').map((letter, index) => (
					<span 
						key={index} 
						className={`train-spelling-letter ${letterStates[index] ? 'selected' : ''}`}
						onClick={() => toggleLetter(index)}
					>
						{letter}
					</span>
				))}
			</div>
		</div>
		<div className="train-update-section">
			<button 
				className="train-update-btn"
				onClick={handleSaveSpellingTemplate}
			>
				Save Spelling Template
			</button>
		</div>
	</>
)}
			{trainingMode === 'usage' && (
				<div className="train-usage-section">
					{isLoadingUsage && (
						<div className="train-usage-loading">Generating usage examples...</div>
					)}
					{usageError && (
						<div className="train-usage-error">{usageError}</div>
					)}
					{usageSentences.length > 0 && (
						<div className="train-usage-sentences">
							{usageSentences.map((sentence, index) => (
								<div key={index} className="train-usage-sentence">
									{index + 1}. {sentence}
								</div>
							))}
						</div>
					)}
				</div>
			)}
			{trainList.length > 0 ? (
				<div className="train-words-list">
					{trainList.map((item, index) => (
				<div key={index} className="train-word-item">
					<span className="train-word-text">{item.word}</span>
					{item.train === 'spelling' && item.details && (
						<span className="train-word-details"> ({item.details})</span>
					)}
					{item.archnemesis && (
							<span className="train-word-archnemesis"> vs {item.archnemesis}</span>
						)}
					</div>
				))}
				</div>
			) : (
				<div style={{ padding: '100px 20px', textAlign: 'center', color: '#666' }}>
					<p>No training words yet.</p>
				</div>
			)}
		</div>
	);
}

export default withRouter(Train);
