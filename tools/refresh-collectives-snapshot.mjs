// Explicit maintenance only; normal builds and visitors use the public snapshot.
import fs from 'node:fs/promises';
import { combineCollectives } from '../src/public-content/collective-data.mjs';
const endpoint = 'https://wordmage.toews-api.com/get-words';
const response = await fetch(endpoint, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Unable to retrieve collective nouns (${response.status})`);
const { collective } = await response.json();
if (!Array.isArray(collective) || !collective.length) throw new Error('No collective nouns in the public response');
const records = collective.map(item => {
    for (const field of ['term', 'refersTo', 'expression', 'source']) {
        if (typeof item[field] !== 'string' || !item[field].trim()) throw new Error(`Invalid collective ${field}`);
    }
    return { term: item.term, refersTo: item.refersTo, expression: item.expression, source: item.source,
        highlight: [true, 1, '1'].includes(item.highlight) };
});
const snapshot = { retrieved: new Date().toISOString().slice(0, 10), endpoint, table: 'collective_nouns', records };
await fs.writeFile(new URL('../src/public-content/collectives.mjs', import.meta.url), `export default ${JSON.stringify(snapshot, null, 2)};\n`);
console.log(`Updated ${records.length} collective-noun records (${combineCollectives(records).length} distinct expressions).`);
