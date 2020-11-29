const fs = require('fs');

const luciferous = require('./luciferous.json');
var words = {};
luciferous.forEach(item => {
	words[item.word] = item.def;
});
fs.writeFile('./luciferous-list.json', JSON.stringify(words), 'utf8', function(err) { console.log('err', err); });
