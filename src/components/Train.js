import { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';
import WordScroller from './WordScroller';
import DataSource from '../utils/data-source';

function Train(props) {
	const [trainList, setTrainList] = useState([]);
	const [wordToTrain, setWordToTrain] = useState('');
	const [definition, setDefinition] = useState('');
	const [trainingMode, setTrainingMode] = useState(null); // 'usage' or 'spelling' or null
	const [archnemesis, setArchnemesis] = useState('');
	const [examples, setExamples] = useState('');
	const [letterStates, setLetterStates] = useState([]);
	const [usageSentences, setUsageSentences] = useState([]);
	const [isLoadingUsage, setIsLoadingUsage] = useState(false);
	const [usageError, setUsageError] = useState(null);
	const [currentTrainingWord, setCurrentTrainingWord] = useState(null);
	const [editingIndex, setEditingIndex] = useState(null);
	const [userSentence, setUserSentence] = useState('');

	const isWhatToTrain = props.location.pathname === '/what-to-train';
	const isTrainingRoom = props.location.pathname === '/training-room';

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

		// Select a random usage training word for Training Room
		if (isTrainingRoom) {
			const usageWords = trainingWords.filter(item => item.train === 'usage');
			if (usageWords.length > 0) {
				const randomIndex = Math.floor(Math.random() * usageWords.length);
				setCurrentTrainingWord(usageWords[randomIndex]);
			}
		}
	}, [isTrainingRoom]);

	const handleWordInput = (e) => {
		const word = e.target.value;
		setWordToTrain(word);
		// Initialize letter states for spelling mode
		setLetterStates(word.split('').map(() => false));
	};

	const handleArchnemesisInput = (e) => {
		setArchnemesis(e.target.value);
	};

	const handleDefinitionInput = (e) => {
		setDefinition(e.target.value);
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
			definition: definition.trim() || null,
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

		if (editingIndex !== null) {
			// Update existing entry
			trainingRoom[editingIndex] = trainingData;
		} else {
			// Add new entry
			trainingRoom.push(trainingData);
		}

		// Save back to localStorage
		try {
			localStorage.setItem('my-training-room', JSON.stringify(trainingRoom));
			// Update the displayed list immediately
			setTrainList(trainingRoom);
			// Save to database if logged in
			DataSource.saveTrainingData();
			alert(editingIndex !== null ? 'Spelling template updated successfully!' : 'Spelling template saved successfully!');
			// Clear form
			setWordToTrain('');
			setDefinition('');
			setLetterStates([]);
			setEditingIndex(null);
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
			definition: definition.trim() || null,
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

		if (editingIndex !== null) {
			// Update existing entry
			trainingRoom[editingIndex] = trainingData;
		} else {
			// Add new entry
			trainingRoom.push(trainingData);
		}

		// Save back to localStorage
		try {
			localStorage.setItem('my-training-room', JSON.stringify(trainingRoom));
			// Update the displayed list immediately
			setTrainList(trainingRoom);
			// Save to database if logged in
			DataSource.saveTrainingData();
			alert(editingIndex !== null ? 'Training material updated successfully!' : 'Training material saved successfully!');
			// Clear form
			setWordToTrain('');
			setDefinition('');
			setArchnemesis('');
			setExamples('');
			setEditingIndex(null);
		} catch (e) {
			console.error('Error saving training room data:', e);
			alert('Failed to save training material');
		}
	};

	const handleTrainingItemClick = (item, index) => {
		setWordToTrain(item.word);
		setDefinition(item.definition || '');
		setTrainingMode(item.train);
		setEditingIndex(index);

		if (item.train === 'usage') {
			setArchnemesis(item.archnemesis || '');
			setExamples(item.details || '');
		} else if (item.train === 'spelling') {
			const pattern = item.details || '';
			const letters = item.word.split('');
			const states = letters.map((letter, i) => pattern[i] === '-');
			setLetterStates(states);
		}
	};

	const handleNavigate = () => {
		if (isTrainingRoom) {
			props.history.push('/what-to-train');
		} else {
			props.history.push('/training-room');
		}
	};

	return (
		<div className="browse-container train-page">
			<div className="train-toolbar">
				<div className="train-toolbar-title">{isWhatToTrain ? 'What To Train' : 'Training Room'}</div>
				<button className="train-nav-button" onClick={handleNavigate}>
					{isTrainingRoom ? 'Setup' : 'Train'}
				</button>
			</div>
			{isTrainingRoom && currentTrainingWord && (
				<div className="training-room-content">
					<div className="training-word-card">
						<div className="word-item-word-container">
							<div className="word-item-word">{currentTrainingWord.word}</div>
						</div>
						{currentTrainingWord.definition && (
							<div className="word-item-def-container">
								<div className="word-item-def">{currentTrainingWord.definition}</div>
							</div>
						)}
					</div>
					<div className="training-details-section">
						<div className="training-details">{currentTrainingWord.details}</div>
					</div>
					<div className="training-input-section">
						<label htmlFor="user-sentence-input">Write your own sentence using "{currentTrainingWord.word}":</label>
						<textarea
							id="user-sentence-input"
							className="training-sentence-input"
							value={userSentence}
							onChange={(e) => setUserSentence(e.target.value)}
							placeholder="Type your sentence here..."
							rows="3"
						/>
					</div>
				</div>
			)}
			{isWhatToTrain && (
				<>
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
			<div className="train-definition-section">
				<label htmlFor="train-definition-input">Definition</label>
				<input 
					id="train-definition-input"
					type="text" 
					autoCapitalize="off" 
					className="train-definition-input" 
					value={definition}
					onChange={handleDefinitionInput} 
					placeholder="Enter definition" 
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
{editingIndex !== null ? 'Save' : 'Update Training Material'}
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
				{editingIndex !== null ? 'Save' : 'Save Spelling Template'}
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
				<div 
					key={index} 
					className="train-word-item"
					onClick={() => handleTrainingItemClick(item, index)}
					style={{ cursor: 'pointer' }}
				>
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
				</>
			)}
		</div>
	);
}

export default withRouter(Train);
