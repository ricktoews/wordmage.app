import collectiveData from './collectives.mjs';
function interestLevel(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}
function compareCollectives(a, b) {
    const first = interestLevel(a.interest_level);
    const second = interestLevel(b.interest_level);
    if (first !== second) {
        if (first === null) return 1;
        if (second === null) return -1;
        return second - first;
    }
    return a.refersTo.localeCompare(b.refersTo) || a.expression.localeCompare(b.expression);
}
function combineCollectives(records) {
    const merged = new Map();
    records.filter(item => ![true, 1, '1'].includes(item.hide_term)).forEach(item => {
        const key = [item.term, item.refersTo, item.expression].map(value => value.trim().toLowerCase()).join('|');
        if (!merged.has(key)) merged.set(key, { ...item, sources: [], notes: [] });
        const entry = merged.get(key);
        if (!entry.sources.includes(item.source)) entry.sources.push(item.source);
        const note = typeof item.note === 'string' ? item.note.trim() : '';
        if (note && !entry.notes.includes(note)) entry.notes.push(note);
        if (!entry.image_path && item.image_path) entry.image_path = item.image_path;
        entry.highlight = entry.highlight || item.highlight;
        const incomingLevel = interestLevel(item.interest_level);
        const savedLevel = interestLevel(entry.interest_level);
        entry.interest_level = incomingLevel === null ? savedLevel : savedLevel === null ? incomingLevel : Math.max(savedLevel, incomingLevel);
    });
    return [...merged.values()].sort(compareCollectives);
}
// Group after sorting, preserving the leading expression's interest ranking.
function groupCollectivesBySubject(entries) {
    const groups = new Map();
    entries.forEach(item => {
        const key = item.refersTo.trim().toLowerCase();
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
    });
    return [...groups.values()];
}
const categories = [...(collectiveData.categories || [])].sort((a, b) => a.sortOrder - b.sortOrder);
const collectives = combineCollectives(collectiveData.records);
const collectiveKey = item => [item.term, item.refersTo, item.expression].map(value => value.trim().toLowerCase()).join('|');
export { groupCollectivesBySubject, interestLevel, compareCollectives, categories, collectives, collectiveKey, combineCollectives };
