const urls = {
	share: '//rest.toewsweb.net/words/sendlocal',
	receive: '//rest.toewsweb.net/words/retrievelocal/'
};

async function share(data) {
	const response = await fetch(urls.share, {
		method: 'POST',
//		mode: 'no-cors',
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

