function cloneJSON(obj) {
	var clone = obj;
	try {
		clone = JSON.parse(JSON.stringify(obj));	
	} catch(e) {
		console.log('Hit snag cloning JSON:', e);	
	}
	return clone;
}

export { cloneJSON };
