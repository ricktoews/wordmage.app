import { combineCollectives } from './collective-data.mjs';

export function collectiveImageUrl(path) {
    if (typeof path !== 'string' || !path.trim()) return null;
    try {
        const url = new URL(path.trim(), 'https://wordmage.toews-api.com/');
        return url.protocol === 'https:' ? url.href : null;
    } catch (_) { return null; }
}

export function normalizeCollectiveResponse(data) {
    if (!Array.isArray(data) || !data.length) throw new Error('Invalid collective nouns response');
    const categories = new Map();
    const records = data.map(item => {
        for (const field of ['term', 'refersTo', 'expression', 'source']) {
            if (typeof item[field] !== 'string' || !item[field].trim()) throw new Error(`Invalid collective ${field}`);
        }
        const category = item.category;
        const id = Number(category?.id);
        if (!Number.isInteger(id) || id <= 0 || !category.name || !category.slug) throw new Error('Invalid collective category');
        categories.set(id, { id, name: category.name, slug: category.slug, description: category.description, imagePath: collectiveImageUrl(category.imagePath),
            sortOrder: Number(category.sortOrder) || 0 });
        return { term: item.term, refersTo: item.refersTo, expression: item.expression, source: item.source,
            highlight: [true, 1, '1'].includes(item.highlight), categoryId: id };
    });
    return { records, collectives: combineCollectives(records), categories: [...categories.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id) };
}
