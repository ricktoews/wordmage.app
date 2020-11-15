function itemToObj(keyValue) {
	var obj = {
		word: Object.keys(keyValue)[0],
		def: Object.values(keyValue)[0]
	};
	return obj;
}

export { itemToObj };
