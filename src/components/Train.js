import { useState, useEffect, useRef } from 'react';
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
	const [showDetailsPopup, setShowDetailsPopup] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const menuDropdownRef = useRef(null);
	// Close menu when clicking outside
	useEffect(() => {
		if (!showMenu) return;
		function handleDocumentClicked(e) {
			if (menuDropdownRef.current && !menuDropdownRef.current.contains(e.target)) {
				setShowMenu(false);
			}
		}
		document.addEventListener('mousedown', handleDocumentClicked);
		return () => document.removeEventListener('mousedown', handleDocumentClicked);
	}, [showMenu]);
	const [notification, setNotification] = useState(null);
	const [checkResult, setCheckResult] = useState(null);
	const [spellingInputs, setSpellingInputs] = useState({});
	const [trainingFilter, setTrainingFilter] = useState('both'); // 'spelling', 'usage', or 'both'
	const [usedWords, setUsedWords] = useState({}); // Track which words have been used
	const firstInputRef = useRef(null);

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

		// Select a random training word for Training Room
		if (isTrainingRoom) {
			let filteredWords = trainingWords;
			if (trainingFilter === 'spelling') {
				filteredWords = trainingWords.filter(word => word.train === 'spelling');
			} else if (trainingFilter === 'usage') {
				filteredWords = trainingWords.filter(word => word.train === 'usage');
			}
			if (filteredWords.length > 0) {
				const randomIndex = Math.floor(Math.random() * filteredWords.length);
				setCurrentTrainingWord(filteredWords[randomIndex]);
				setUsedWords({ [filteredWords[randomIndex].word]: true });
			} else {
				setCurrentTrainingWord(null);
			}
		}
	}, [isTrainingRoom, trainingFilter]);

	// Focus on first input field when a spelling word is displayed
	useEffect(() => {
		if (isTrainingRoom && currentTrainingWord && currentTrainingWord.train === 'spelling') {
			// Small delay to ensure DOM is ready
			setTimeout(() => {
				if (firstInputRef.current) {
					firstInputRef.current.focus();
				}
			}, 100);
		}
	}, [isTrainingRoom, currentTrainingWord]);

	const handleWordInput = (e) => {
		const word = e.target.value;
		setWordToTrain(word);
		// Initialize letter states for spelling mode
		setLetterStates(word.split('').map(() => false));
	}; const handleArchnemesisInput = (e) => {
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
			showNotification(editingIndex !== null ? 'Spelling template updated successfully!' : 'Spelling template saved successfully!');
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
			showNotification(editingIndex !== null ? 'Training material updated successfully!' : 'Training material saved successfully!');
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

	const selectNewWord = () => {
		let filteredWords = trainList;
		if (trainingFilter === 'spelling') {
			filteredWords = trainList.filter(word => word.train === 'spelling');
		} else if (trainingFilter === 'usage') {
			filteredWords = trainList.filter(word => word.train === 'usage');
		}

		if (filteredWords.length === 0) return;

		// If only one word, just use it
		if (filteredWords.length === 1) {
			setCurrentTrainingWord(filteredWords[0]);
			setUserSentence('');
			setSpellingInputs({});
			return;
		}

		// Get unused words
		let availableWords = filteredWords.filter(word => !usedWords[word.word]);

		// If all words have been used, reset the flags
		if (availableWords.length === 0) {
			setUsedWords({});
			availableWords = filteredWords;
		}

		// Select random word from available words
		const randomIndex = Math.floor(Math.random() * availableWords.length);
		const selectedWord = availableWords[randomIndex];

		setCurrentTrainingWord(selectedWord);
		setUserSentence('');
		setSpellingInputs({});

		// Mark this word as used
		setUsedWords(prev => ({
			...prev,
			[selectedWord.word]: true
		}));
	};

	const showNotification = (message) => {
		setNotification(message);
		setTimeout(() => {
			setNotification(null);
		}, 3000);
	};

	const showCheckResult = (message, isSuccess) => {
		setCheckResult({ message, isSuccess });
		setTimeout(() => {
			setCheckResult(null);
		}, 4000);
	};

	const handleCheckSentence = () => {
		if (!userSentence.trim()) {
			showCheckResult('Please write a sentence first.', false);
			return;
		}

		const words = userSentence.trim().split(/\s+/);
		const wordCount = words.length;
		const containsWord = userSentence.toLowerCase().includes(currentTrainingWord.word.toLowerCase());

		if (wordCount < 3) {
			showCheckResult('Your sentence should be at least three words long.', false);
			return;
		}

		if (!containsWord) {
			showCheckResult(`Your sentence should contain the word "${currentTrainingWord.word}".`, false);
			return;
		}

		showCheckResult('Great job! Your sentence meets the criteria.', true);
		setTimeout(() => {
			selectNewWord();
		}, 2000);
	};

	const handleCheckSpelling = () => {
		if (!currentTrainingWord) return;

		const segments = getSpellingSegments(currentTrainingWord.word, currentTrainingWord.details);
		let allCorrect = true;
		let hasInput = false;

		segments.forEach((segment, index) => {
			if (segment.type === 'input') {
				const userInput = (spellingInputs[index] || '').toLowerCase().trim();
				const correctAnswer = segment.value.toLowerCase();

				if (userInput) {
					hasInput = true;
				}

				if (userInput !== correctAnswer) {
					allCorrect = false;
				}
			}
		});

		if (!hasInput) {
			showCheckResult('Please fill in the missing letters first.', false);
			return;
		}

		if (allCorrect) {
			showCheckResult('Perfect! You spelled it correctly.', true);
			setTimeout(() => {
				selectNewWord();
			}, 2000);
		} else {
			showCheckResult('Not quite right. Try again!', false);
		}
	};

	const handleSpellingInputChange = (index, value) => {
		setSpellingInputs(prev => ({
			...prev,
			[index]: value
		}));
	};

	const getDisplayWord = (word, template) => {
		if (!template) return word;

		let result = '';
		let i = 0;
		while (i < template.length) {
			if (template[i] === '-') {
				// Count consecutive hyphens
				let hyphenCount = 0;
				while (i < template.length && template[i] === '-') {
					hyphenCount++;
					i++;
				}
				result += '_';
			} else {
				result += template[i];
				i++;
			}
		}
		return result;
	};

	const getSpellingSegments = (word, template) => {
		if (!template) return [{ type: 'letter', value: word }];

		const segments = [];
		let i = 0;
		while (i < template.length) {
			if (template[i] === '-') {
				// Collect consecutive hyphens and their corresponding letters
				let letters = '';
				while (i < template.length && template[i] === '-') {
					letters += word[i];
					i++;
				}
				segments.push({ type: 'input', value: letters, length: letters.length });
			} else {
				// Collect consecutive non-hyphen letters
				let letters = '';
				while (i < template.length && template[i] !== '-') {
					letters += template[i];
					i++;
				}
				segments.push({ type: 'letter', value: letters });
			}
		}
		return segments;
	};

	return (
		<div className="browse-container train-page">
			{notification && (
				<div className="train-notification">
					{notification}
				</div>
			)}
			{checkResult && (
				<div className={`train-check-result ${checkResult.isSuccess ? 'success' : 'error'}`}>
					{checkResult.message}
				</div>
			)}
			<div className="train-toolbar">
				<div className="train-toolbar-title">{isWhatToTrain ? 'What To Train' : 'Training Room'}</div>
				<div className="train-menu-container">
					<button className="train-menu-btn" onClick={() => setShowMenu(prev => !prev)}>
						<span className="train-menu-dots">&#8942;</span>
					</button>
					{showMenu && (
						<div className="train-menu-dropdown" ref={menuDropdownRef}>
							{isWhatToTrain ? (
								<button className="train-menu-item" onClick={() => { setShowMenu(false); props.history.push('/training-room'); }}>Train</button>
							) : (
								<>
									<button className="train-menu-item" onClick={() => { setShowMenu(false); handleNavigate(); }}>Setup</button>
									<button className="train-menu-item" onClick={() => { setShowMenu(false); setTrainingFilter('spelling'); }}>Spelling</button>
									<button className="train-menu-item" onClick={() => { setShowMenu(false); setTrainingFilter('usage'); }}>Usage</button>
									<button className="train-menu-item" onClick={() => { setShowMenu(false); setTrainingFilter('both'); }}>Both</button>
								</>
							)}
						</div>
					)}
				</div>
			</div>
			{isTrainingRoom && currentTrainingWord && (
				<div className="word-item-word-container" style={{ width: '100%', maxWidth: '400px', margin: '0 auto 0 auto' }}>
					<div className="word-item-word" style={{ fontSize: '2rem', fontWeight: 'bold', flex: 1 }}>
						{currentTrainingWord.train === 'spelling'
							? getDisplayWord(currentTrainingWord.word, currentTrainingWord.details)
							: currentTrainingWord.word
						}
					</div>
					<button
						className="training-next-circle-btn"
						onClick={selectNewWord}
						title="Next"
						type="button"
						style={{ position: 'static', marginLeft: '16px' }}
					>
						<i className="glyphicon glyphicon-forward"></i>
					</button>
				</div>
			)}
			{isTrainingRoom && currentTrainingWord && (
				<div className="training-room-content">
					<div className="training-word-card">
						{currentTrainingWord.train === 'usage' && (
							<div className="training-input-section" style={{ marginBottom: '1em' }}>
								<label htmlFor="user-sentence-input">Write your own sentence using "{currentTrainingWord.word}":</label>
								<textarea
									id="user-sentence-input"
									className="training-sentence-input"
									value={userSentence}
									onChange={(e) => setUserSentence(e.target.value)}
									placeholder="Type your sentence here..."
									rows="3"
								/>
								<button
									className="train-check-btn"
									onClick={handleCheckSentence}
									type="button"
								>
									Check
								</button>
							</div>
						)}
						{currentTrainingWord.definition && (
							<div className="word-item-def-container">
								<div className="word-item-def">{currentTrainingWord.definition}</div>
							</div>
						)}
						{currentTrainingWord.train === 'usage' && currentTrainingWord.details && (
							<div className="word-item-examples-container">
								<div className="word-item-examples-label">Example Sentences:</div>
								<div className="word-item-examples">
									{currentTrainingWord.details.split(/\r?\n|\r|\u2028|\u2029|\.|\!|\?/)
										.map(sentence => sentence.trim())
										.filter(sentence => sentence.length > 0)
										.map((sentence, idx) => (
											<p key={idx}>{sentence}</p>
										))}
								</div>
							</div>
						)}
					</div>
					{currentTrainingWord.train === 'spelling' && (
						<>
							<div className="training-spelling-practice">
								<div className="training-spelling-segments">
									{getSpellingSegments(currentTrainingWord.word, currentTrainingWord.details).map((segment, index) => {
										// Find the index of the first input field
										const inputIndex = getSpellingSegments(currentTrainingWord.word, currentTrainingWord.details)
											.slice(0, index + 1)
											.filter(s => s.type === 'input')
											.length - 1;

										return segment.type === 'input' ? (
											<input
												key={index}
												ref={inputIndex === 0 ? firstInputRef : null}
												type="text"
												className="training-spelling-input"
												maxLength={segment.length}
												style={{ width: `${segment.length * 1.2}em` }}
												placeholder={segment.value.split('').map(() => '_').join('')}
												value={spellingInputs[index] || ''}
												onChange={(e) => handleSpellingInputChange(index, e.target.value)}
											/>
										) : (
											<span key={index} className="training-spelling-letter-display">
												{segment.value}
											</span>
										);
									})}
								</div>
							</div>
							<button
								className="train-check-btn"
								onClick={handleCheckSpelling}
								type="button"
							>
								Check
							</button>
						</>
					)}
					{showDetailsPopup && currentTrainingWord.train === 'usage' && (
						<div
							className="training-details-popup"
							onClick={() => setShowDetailsPopup(false)}
						>
							<div
								className="training-details-content"
								onClick={(e) => e.stopPropagation()}
							>
								<button
									className="training-details-close"
									onClick={() => setShowDetailsPopup(false)}
								>
									×
								</button>
								<h3>Example Sentences</h3>
								<div className="training-details">{currentTrainingWord.details}</div>
							</div>
						</div>
					)}
					{/* Removed duplicate example sentence input field and Check button */}
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
