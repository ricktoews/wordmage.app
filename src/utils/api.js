//const base = 'https://words-rest.toewsweb.net';
const base = 'https://memorize.toewsweb.net';

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

async function login() {
	const url = 'https://testapi.perfectionnext.com/lti/authenticate';
	const credentials = { "username": "toews@mailinator.com", "password": "Tttttt1" };
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(credentials)
	});
	return response;
}

export { share, receive, login };

