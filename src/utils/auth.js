const AUTH_TOKEN_KEY = 'wordmage-auth-token';
const ANONYMOUS_TOKEN_KEY = 'wordmage-anonymous-token';

function getStoredAuthToken() {
	if (typeof localStorage === 'undefined') {
		return null;
	}

	return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(ANONYMOUS_TOKEN_KEY);
}

function storeAuthToken(token) {
	if (typeof localStorage === 'undefined' || !token) {
		return;
	}

	localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function storeAnonymousToken(token) {
	if (typeof localStorage === 'undefined' || !token) {
		return;
	}

	localStorage.setItem(ANONYMOUS_TOKEN_KEY, token);
	localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function persistTokenFromResponse(data, options = {}) {
	const token = data?.token || data?.auth_token || data?.access_token || data?.anonymous_token;
	if (!token) {
		return;
	}

	if (options.anonymous || data?.anonymous_token) {
		storeAnonymousToken(token);
		return;
	}

	storeAuthToken(token);
}

function clearAuthenticatedToken() {
	if (typeof localStorage === 'undefined') {
		return;
	}

	const anonymousToken = localStorage.getItem(ANONYMOUS_TOKEN_KEY);
	if (anonymousToken) {
		localStorage.setItem(AUTH_TOKEN_KEY, anonymousToken);
	} else {
		localStorage.removeItem(AUTH_TOKEN_KEY);
	}
}

function withAuthHeaders(headers = {}) {
	const token = getStoredAuthToken();
	if (!token) {
		return headers;
	}

	return {
		...headers,
		Authorization: `Bearer ${token}`
	};
}

function authFetch(url, options = {}) {
	return fetch(url, {
		...options,
		headers: withAuthHeaders(options.headers || {})
	});
}

export {
	AUTH_TOKEN_KEY,
	ANONYMOUS_TOKEN_KEY,
	authFetch,
	clearAuthenticatedToken,
	getStoredAuthToken,
	persistTokenFromResponse,
	storeAnonymousToken,
	storeAuthToken,
	withAuthHeaders,
};
