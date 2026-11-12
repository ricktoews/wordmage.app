const { test } = require('node:test');
const assert = require('node:assert/strict');
const modulePromise = import('../src/public-content/landing-selection.mjs');
const word = (id, flags = {}) => ({ id, word: `word-${id}`, definition: `Meaning ${id}`, ...flags });

test('only explicitly flagged, valid words enter each public collection', async () => {
    const { eligibleWords } = await modulePromise;
    const records = [word(1, { is_rare: '1' }), word(2, { is_gothic: true }), word(3, { is_rare: '0' }), word(4), word(1, { is_rare: 1 }), { ...word(5, { is_rare: 1 }), definition: '' }];
    assert.deepEqual(eligibleWords(records, 'rare').map(w => w.id), ['1']);
    assert.deepEqual(eligibleWords(records, 'gothic').map(w => w.id), ['2']);
});

test('refresh prefers new words and changes the feature even for a small pool', async () => {
    const { selectWords } = await modulePromise;
    const pool = Array.from({ length: 30 }, (_, i) => word(i + 1, { is_rare: 1 }));
    const first = selectWords(pool, 'rare', [], () => .5);
    const next = selectWords(pool, 'rare', first, () => .5);
    assert.equal(first.length, 9);
    assert.ok(next.every(w => !first.some(old => old.id === w.id)));
    const small = pool.slice(0, 2);
    const initial = selectWords(small, 'rare', [], () => .9);
    assert.notEqual(selectWords(small, 'rare', initial, () => .9)[0].id, initial[0].id);
    assert.deepEqual(selectWords([], 'rare'), []);
});

test('session selections remain independent for each page and survive module reload', async () => {
    const saved = new Map();
    global.sessionStorage = { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) };
    const { saveSelection, readSelection } = await modulePromise;
    const rare = [word(31, { is_rare: 1 })];
    saveSelection('rare', rare);
    assert.deepEqual(readSelection('rare'), rare);
    const reloaded = await import('../src/public-content/landing-selection.mjs?reload');
    assert.equal(reloaded.readSelection('rare')[0].id, '31');
    assert.equal(reloaded.readSelection('gothic'), null);
    saved.clear();
    const newSession = await import('../src/public-content/landing-selection.mjs?new-session');
    assert.equal(newSession.readSelection('rare'), null);
    delete global.sessionStorage;
});

test('dedicated endpoint membership is accepted only for a validated themed response', async () => {
    const { landingResponse } = await modulePromise;
    assert.equal(landingResponse({ success: true, page: 'rare', words: [word(40)] }, 'rare')[0].is_rare, 1);
    assert.throws(() => landingResponse({ success: true, page: 'gothic', words: [word(40)] }, 'rare'));
    assert.throws(() => landingResponse({ success: false, page: 'rare', words: [word(40)] }, 'rare'));
    assert.throws(() => landingResponse({ success: true, page: 'rare', words: [] }, 'rare'));
});

test('landing normalization and session persistence preserve supplied examples', async () => {
    const { landingResponse, saveSelection } = await modulePromise;
    const example = { sentence: 'The clepsydra marked the passing hours.', source: 'AI-generated' };
    const words = landingResponse({ success: true, page: 'rare', words: [{ ...word(99), examples: [example] }] }, 'rare');
    assert.deepEqual(words[0].examples, [example]);
    const data = new Map();
    global.sessionStorage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
    saveSelection('rare', words);
    const reloaded = await import('../src/public-content/landing-selection.mjs?examples');
    assert.deepEqual(reloaded.readSelection('rare')[0].examples, [example]);
    delete global.sessionStorage;
});
