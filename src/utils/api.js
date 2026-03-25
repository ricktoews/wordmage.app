//const base = 'https://words-rest.toewsweb.net';
const base = 'https://wordmage.toews-api.com';

const urls = {
	share: base + '/words.php/sendlocal',
	receive: base + '/words.php/retrievelocal/'
};

async function share(data) {
	const response = await fetch(urls.share, {
		method: 'POST',
		//		mode: 'no-cors',
		//		cache: 'no-cache',
		//		credentials: 'omit',
		//		referrerPolicy: 'no-referrer-when-downgrade',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	return response.json();
}

async function receive(code) {
	const response = await fetch(urls.receive + code);
	return response.json();
}

async function getWordsPage(params = {}) {
	const { starts_with = 'a', after_word, limit = 200 } = params;
	const queryParams = new URLSearchParams();

	queryParams.append('starts_with', starts_with);
	if (after_word) {
		queryParams.append('after_word', after_word);
	}
	queryParams.append('limit', limit);

	const response = await fetch(`${base}/get-words-page?${queryParams.toString()}`);
	return response.json();
}

async function getRandomPageData(user_id) {
	const response = await fetch(`${base}/get-random-page-data`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ user_id })
	});
	return response.json();
}


export { share, receive, getWordsPage, getRandomPageData };

