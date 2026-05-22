import React from 'react';
import { createRoot } from 'react-dom/client'; // Updated import
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import WordsInterface from './utils/words-interface';
import { CONFIG } from './config';
import { authFetch, persistTokenFromResponse } from './utils/auth';

const PROFILE_USER_ID_KEY = 'wordmage-profile-user_id';
const ANONYMOUS_USER_ID_KEY = 'wordmage-anonymous-user_id';
const ANONYMOUS_TOKEN_KEY = 'wordmage-anonymous-token';

async function initCustom(user_id) {
	var options = {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({ user_id })
	};
	var response = await authFetch(`${CONFIG.domain}/loadcustom`, options);
	var data = await response.json();
	const albumIds = data?.album_ids || {};
	WordsInterface.initializeCustom(albumIds);

	const favoritesAlbumId = albumIds.Favorites;
	if (favoritesAlbumId) {
		try {
			const favoritesResponse = await authFetch(`${CONFIG.domain}/albums/${favoritesAlbumId}`);
			const favoritesData = await favoritesResponse.json();
			WordsInterface.setFavoriteWords(Array.isArray(favoritesData?.words) ? favoritesData.words : []);
		} catch (error) {
			console.error('Failed to load Favorites album words:', error);
			WordsInterface.setFavoriteWords([]);
		}
	} else {
		WordsInterface.setFavoriteWords([]);
	}
}

async function createAnonymousUser() {
	var response = await fetch(`${CONFIG.domain}/anonymous-user`, {
		method: 'POST'
	});
	var data = await response.json();

	if (!data?.user_id) {
		throw new Error('Anonymous user response did not include user_id');
	}

	localStorage.setItem(ANONYMOUS_USER_ID_KEY, data.user_id);
	localStorage.setItem(PROFILE_USER_ID_KEY, data.user_id);

	if (data.anonymous_token) {
		localStorage.setItem(ANONYMOUS_TOKEN_KEY, data.anonymous_token);
	}
	persistTokenFromResponse(data, { anonymous: true });

	return data.user_id;
}

async function getActiveUserId() {
	var profile_user_id = localStorage.getItem(PROFILE_USER_ID_KEY);
	if (profile_user_id) {
		return profile_user_id;
	}

	var anonymous_user_id = localStorage.getItem(ANONYMOUS_USER_ID_KEY);
	if (anonymous_user_id) {
		localStorage.setItem(PROFILE_USER_ID_KEY, anonymous_user_id);
		return anonymous_user_id;
	}

	try {
		return await createAnonymousUser();
	} catch (error) {
		console.error('Failed to create anonymous user:', error);
		return null;
	}
}

(async () => {
	var active_user_id = await getActiveUserId();
	if (active_user_id) {
		await initCustom(active_user_id); // Ensure this completes before rendering
	}
	//	await WordsInterface.initializeWordPool();

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
