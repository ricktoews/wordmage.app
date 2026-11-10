import collectiveData from './collectives.mjs';
function combineCollectives(records) {
    const merged = new Map();
    records.forEach(item => {
        const key = [item.term, item.refersTo, item.expression].map(value => value.trim().toLowerCase()).join('|');
        if (!merged.has(key)) merged.set(key, { ...item, sources: [] });
        const entry = merged.get(key);
        if (!entry.sources.includes(item.source)) entry.sources.push(item.source);
        entry.highlight = entry.highlight || item.highlight;
    });
    return [...merged.values()].sort((a, b) => a.refersTo.localeCompare(b.refersTo));
}
const collectives = combineCollectives(collectiveData.records);
const collectiveKey = item => [item.term, item.refersTo, item.expression].map(value => value.trim().toLowerCase()).join('|');
export { collectives, collectiveKey, combineCollectives };
