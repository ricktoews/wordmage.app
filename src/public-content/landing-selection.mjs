// Shared validation and sampling for browser sessions and build-time snapshots.
const themes = { rare: 'is_rare', gothic: 'is_gothic' };

function eligibleWords(records, theme) {
    const flag = themes[theme];
    if (!flag || !Array.isArray(records)) throw new Error('Invalid landing vocabulary data');
    const seen = new Set();
    return records.flatMap(record => {
        const definition = record.def ?? record.definition;
        if (![1, '1', true].includes(record[flag]) || !record.id ||
            typeof record.word !== 'string' || !record.word.trim() ||
            typeof definition !== 'string' || !definition.trim() || seen.has(String(record.id))) return [];
        seen.add(String(record.id));
        return [{ id: String(record.id), word: record.word, def: definition,
            source: typeof record.source === 'string' ? record.source : '',
            examples: Array.isArray(record.examples) ? record.examples : [], [flag]: 1 }];
    });
}

function selectWords(records, theme, previous = [], random = Math.random) {
    const pool = eligibleWords(records, theme);
    const count = theme === 'rare' ? 9 : 13;
    // Prefer unseen entries when the pool is large enough. With a small pool,
    // reshuffle it and ensure the featured entry changes whenever possible.
    const previousIds = new Set(previous.map(word => String(word.id)));
    const unseen = pool.filter(word => !previousIds.has(word.id));
    const candidates = unseen.length >= Math.min(count, pool.length) ? unseen : pool;
    const shuffled = [...candidates];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    if (shuffled.length > 1 && shuffled[0].id === String(previous[0]?.id)) {
        [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    return shuffled.slice(0, count);
}

function landingResponse(data, theme) {
    if (data?.success !== true || data.page !== theme || !Array.isArray(data.words)) {
        throw new Error('Invalid landing vocabulary response');
    }
    // The dedicated endpoint filters by the database flag but omits that column
    // from its response. Only this validated response may establish membership.
    const words = eligibleWords(data.words.map(word => ({ ...word, [themes[theme]]: 1 })), theme);
    if (!words.length) throw new Error('No landing vocabulary available');
    return words;
}

const memory = new Map();
const keyFor = theme => `wordmage.landing-selection.v1.${theme}`;
function readSelection(theme) {
    if (memory.has(theme)) return memory.get(theme);
    try {
        const raw = JSON.parse(sessionStorage.getItem(keyFor(theme)));
        const words = eligibleWords(raw, theme);
        if (words.length) { memory.set(theme, words); return words; }
    } catch (_) { /* Storage may be unavailable or contain obsolete data. */ }
    return null;
}
function saveSelection(theme, words) {
    memory.set(theme, words);
    try { sessionStorage.setItem(keyFor(theme), JSON.stringify(words)); } catch (_) { /* In-memory continuity still works. */ }
}

export { landingResponse, eligibleWords, selectWords, readSelection, saveSelection };
