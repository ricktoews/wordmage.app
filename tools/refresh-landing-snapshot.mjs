// Explicit maintenance command; normal builds use the checked-in snapshot.
import fs from 'node:fs/promises';
import { landingResponse } from '../src/public-content/landing-selection.mjs';
const base = 'https://wordmage.toews-api.com';
let token = process.env.WORDMAGE_SNAPSHOT_TOKEN;
const timeout = () => AbortSignal.timeout(30000);
if (!token && process.argv.includes('--anonymous')) {
    const response = await fetch(`${base}/anonymous-user`, { method: 'POST', signal: timeout() });
    if (!response.ok) throw new Error(`Anonymous authentication failed (${response.status})`);
    const data = await response.json();
    token = data.anonymous_token || data.token || data.auth_token;
}
if (!token) throw new Error('Set WORDMAGE_SNAPSHOT_TOKEN or pass --anonymous to create a temporary anonymous workspace.');
const snapshot = { retrievedAt: new Date().toISOString() };
for (const page of ['rare', 'gothic']) {
    const response = await fetch(`${base}/get-landing-page-words`, {
        method: 'POST', signal: timeout(),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ page, count: 20 })
    });
    if (!response.ok) throw new Error(`Unable to retrieve ${page} words (${response.status})`);
    snapshot[page] = landingResponse(await response.json(), page);
}
// Write only after BOTH responses pass validation. Never write credentials.
await fs.writeFile(new URL('../src/public-content/landing-snapshot.json', import.meta.url), `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Updated public snapshots: ${snapshot.rare.length} rare, ${snapshot.gothic.length} gothic.`);
