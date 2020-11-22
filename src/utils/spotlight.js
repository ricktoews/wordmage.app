function scramble(word) {
	var letters = word.split('');
	var itemCount = letters.length;
	var scrambled = '';
	var safety = 100;
	while (itemCount > 0 && safety > 0) {
		var rnd = Math.floor(Math.random() * itemCount);
		scrambled += letters.splice(rnd,1);
		itemCount = letters.length;
		safety--;
	}
	return scrambled;
}

export { scramble };
