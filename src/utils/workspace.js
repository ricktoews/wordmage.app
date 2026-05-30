import { CONFIG } from '../config';
import WordsInterface from './words-interface';
import { authFetch, persistTokenFromResponse, removeAnonymousToken } from './auth';

const PROFILE_USER_ID_KEY = 'wordmage-profile-user_id';
const ANONYMOUS_USER_ID_KEY = 'wordmage-anonymous-user_id';
const ANONYMOUS_TOKEN_KEY = 'wordmage-anonymous-token';
const PENDING_ALBUM_CLAIM_KEY = 'wordmage.pendingAlbumClaim';

async function loadUserWorkspace(userId) {
	if (!userId) {
		WordsInterface.initializeCustom({});
		WordsInterface.setFavoriteWords([]);
		return {};
	}

	const response = await authFetch(`${CONFIG.domain}/loadcustom`, {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({ user_id: userId })
	});
	const data = await response.json();
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

	return albumIds;
}

async function createAnonymousUser() {
	const response = await fetch(`${CONFIG.domain}/anonymous-user`, {
		method: 'POST',
		cache: 'no-store'
	});
	const data = await response.json();

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
	const profileUserId = localStorage.getItem(PROFILE_USER_ID_KEY);
	if (profileUserId) {
		return profileUserId;
	}

	const anonymousUserId = localStorage.getItem(ANONYMOUS_USER_ID_KEY);
	if (anonymousUserId) {
		localStorage.setItem(PROFILE_USER_ID_KEY, anonymousUserId);
		return anonymousUserId;
	}

	return createAnonymousUser();
}

async function ensureActiveWorkspace() {
	const userId = await getActiveUserId();
	await loadUserWorkspace(userId);
	return userId;
}

async function getAnonymousAlbumsForClaim() {
	const anonymousUserId = localStorage.getItem(ANONYMOUS_USER_ID_KEY);
	const anonymousToken = localStorage.getItem(ANONYMOUS_TOKEN_KEY);

	if (!anonymousUserId || !anonymousToken) {
		return null;
	}

	const response = await fetch(`${CONFIG.domain}/albums`, {
		cache: 'no-store',
		headers: {
			Authorization: `Bearer ${anonymousToken}`
		}
	});
	const data = await response.json();
	const albums = Array.isArray(data)
		? data.filter((album) => album.title !== 'Learn')
		: [];

	if (albums.length === 0) {
		return null;
	}

	return {
		anonymousUserId,
		anonymousToken,
		albums
	};
}

async function claimAnonymousAlbums({ anonymousUserId, anonymousToken, albumIds }) {
	const response = await authFetch(`${CONFIG.domain}/anonymous-user/claim-albums`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			anonymous_user_id: anonymousUserId,
			anonymous_token: anonymousToken,
			album_ids: albumIds,
			delete_remaining_albums: true
		})
	});

	if (!response.ok) {
		throw new Error(`Failed to preserve anonymous albums: ${response.status}`);
	}

	return response.json().catch(() => ({}));
}

function clearAnonymousWorkspace() {
	localStorage.removeItem(ANONYMOUS_USER_ID_KEY);
	localStorage.removeItem(ANONYMOUS_TOKEN_KEY);
	removeAnonymousToken();
}

function clearPendingAlbumClaim() {
	localStorage.removeItem(PENDING_ALBUM_CLAIM_KEY);
}

function getPendingAlbumClaim() {
	try {
		const pendingClaim = localStorage.getItem(PENDING_ALBUM_CLAIM_KEY);
		return pendingClaim ? JSON.parse(pendingClaim) : null;
	} catch (error) {
		console.error('Failed to read pending album claim:', error);
		clearPendingAlbumClaim();
		return null;
	}
}

function hasPendingAlbumClaim() {
	return Boolean(getPendingAlbumClaim());
}

function savePendingAlbumClaim(claimContext) {
	localStorage.setItem(PENDING_ALBUM_CLAIM_KEY, JSON.stringify(claimContext));
}

export {
	ANONYMOUS_TOKEN_KEY,
	ANONYMOUS_USER_ID_KEY,
	PENDING_ALBUM_CLAIM_KEY,
	PROFILE_USER_ID_KEY,
	clearPendingAlbumClaim,
	createAnonymousUser,
	ensureActiveWorkspace,
	getActiveUserId,
	claimAnonymousAlbums,
	clearAnonymousWorkspace,
	getAnonymousAlbumsForClaim,
	getPendingAlbumClaim,
	hasPendingAlbumClaim,
	loadUserWorkspace,
	savePendingAlbumClaim,
};
