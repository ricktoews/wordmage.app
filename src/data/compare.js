const fs = require('fs');

const luciferous = require('./word-pool.json');
const phront = require('./clw-complete.json');
const l_words = {};
const p_words = {};
const pnotl = {};
const lnotp = {};
const both = {};
luciferous.forEach(item => {
	let word = item.word;
	l_words[word] = item.def;
});
phront.forEach(item => {
	let word = item.word;
	p_words[word] = item.def;
	if (!l_words[word]) {
		pnotl[word] = item.def;
	} else {
		both[word] = { luciferous: l_words[word], phront: item.def };
	}
});
luciferous.forEach(item => {
	let word = item.word;
	if (!p_words[word]) {
		lnotp[word] = item.def;
	}
});

fs.writeFile('./p-not-l.json', JSON.stringify(pnotl), 'utf8', function(err) { console.log('err', err); });
fs.writeFile('./l-not-p.json', JSON.stringify(lnotp), 'utf8', function(err) { console.log('err', err); });
fs.writeFile('./both.json', JSON.stringify(both), 'utf8', function(err) { console.log('err', err); });
console.log('p-not-l count', Object.keys(pnotl).length);
console.log('l-not-p count', Object.keys(lnotp).length);
console.log('both count', Object.keys(both).length);
