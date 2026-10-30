//const base = 'https://words-rest.toewsweb.net';
import { authFetch } from './auth';

const base = 'https://wordmage.toews-api.com';

async function getWordsPage(params = {}) {
	const { starts_with = 'a', after_word, limit = 200 } = params;
	const queryParams = new URLSearchParams();

	queryParams.append('starts_with', starts_with);
	if (after_word) {
		queryParams.append('after_word', after_word);
	}
	queryParams.append('limit', limit);

	const response = await authFetch(`${base}/get-words-page?${queryParams.toString()}`);
	return response.json();
}

async function getRandomPageData(user_id) {
	const response = await authFetch(`${base}/get-random-page-data`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ user_id })
	});
	return response.json();
}


async function getInboxWords() {
	const response = await authFetch(`${base}/inbox-words`);
	if (!response.ok) {
		throw new Error(`Unable to load inbox words (${response.status})`);
	}
	const data = await response.json();
	const words = Array.isArray(data) ? data : data.words || data.records;
	if (!Array.isArray(words)) {
		throw new Error('Invalid inbox words response');
	}
	return words.map(word => ({ ...word, def: word.def ?? word.definition }));
}

async function markInboxWordsRead() {
	const response = await authFetch(`${base}/inbox-words/mark-read`, {
		method: 'POST'
	});
	if (!response.ok) {
		throw new Error(`Unable to mark inbox words as read (${response.status})`);
	}
}

async function removeInboxWords(wordIds) {
	const response = await authFetch(`${base}/inbox-words/remove`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ word_ids: wordIds })
	});
	if (!response.ok) {
		throw new Error(`Unable to remove inbox words (${response.status})`);
	}
}

export { getWordsPage, getRandomPageData, getInboxWords, markInboxWordsRead, removeInboxWords };
