// Explicit maintenance only; normal builds use the saved public snapshot.
import fs from 'node:fs/promises';
import { normalizeCollectiveResponse } from '../src/public-content/collective-response.mjs';
const endpoint = 'https://wordmage.toews-api.com/collective-nouns';
const response = await fetch(endpoint, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Unable to retrieve collective nouns (${response.status})`);
const { records, categories, collectives } = normalizeCollectiveResponse(await response.json());
const snapshot = { retrieved: new Date().toISOString().slice(0, 10), endpoint, table: 'collective_nouns', categories, records };
await fs.writeFile(new URL('../src/public-content/collectives.mjs', import.meta.url), `export default ${JSON.stringify(snapshot, null, 2)};\n`);
console.log(`Updated ${records.length} records (${collectives.length} distinct expressions) in ${categories.length} categories.`);
