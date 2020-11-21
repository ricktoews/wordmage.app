//const base = 'https://words-rest.toewsweb.net';
const base = 'https://memorize.toewsweb.net';

const urls = {
	share: base + '/words.php/sendlocal',
	receive: base + '/words.php/retrievelocal/'
};

async function share(data) {
	const response = await fetch(urls.share, {
		method: 'POST',
//		mode: 'cors',
//		cache: 'no-cache',
		credentials: 'omit',
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

export { share, receive };

