import React from 'react';
import { createRoot } from 'react-dom/client'; // Updated import
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import WordsInterface from './utils/words-interface';
import { CONFIG } from './config';

async function initCustom(user_id) {
	var options = {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({ user_id })
	};
	var response = await fetch(`${CONFIG.domain}/loadcustom`, options);
	var data = await response.json();
	if (!data) data = { custom: [], training: [] };
	if (!data.custom) data.custom = [];
	if (!data.training) data.training = [];
	WordsInterface.initializeCustom(data.custom);
	// Save training data to localStorage
	localStorage.setItem('my-training-room', JSON.stringify(data.training));
}

(async () => {
	var profile_user_id = localStorage.getItem('wordmage-profile-user_id');
	if (profile_user_id) {
		await initCustom(profile_user_id); // Ensure this completes before rendering
	}
	await WordsInterface.initializeWordPool();

	// Use createRoot instead of ReactDOM.render
	const root = createRoot(document.getElementById('root'));
	root.render(
		<React.StrictMode>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</React.StrictMode>
	);
})();

reportWebVitals();