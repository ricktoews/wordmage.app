const fs = require('fs');

const pool = require('./word-pool.json');
const clw = require('./clw-complete.json');

var words = [];
words = words.concat(pool);
words = words.concat(clw);
words.sort((a, b) => a.word.toLowerCase() < b.word.toLowerCase() ? -1 : 1);

console.log(words);

const filename = './pool-clw.json';
fs.writeFile(filename, JSON.stringify(words, null, 4), 'utf8', function(err) { if (err) console.log('Error writing', err); });
