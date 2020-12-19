const fs = require('fs');

const url = `https://www.worldwidewords.org/genindex.htm`;
const infile = `./clc.tsv`;
const filename = `./clc.json`;
function scrape() {

	var out = [];
	fs.readFile(infile, 'UTF8', (err, data) => {
		if (data) {
			var rows = data.split("\n");
			var rowNdx = 0;
			while (rowNdx < rows.length) {
				let row = rows[rowNdx];
				let cols = row.split("\t");
				let word = cols[1];
				let def = cols[3];
				out.push({ word, def });
if (rowNdx < 10) {
	console.log({ word, def });
}
				
				rowNdx++;
			}
		}
	
		fs.writeFile(filename, JSON.stringify(out, null, 4), 'utf8', function(err) { if (err) console.log('Error writing', err); });
	});
}

scrape();
