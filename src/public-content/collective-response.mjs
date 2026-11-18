import { combineCollectives, interestLevel } from './collective-data.mjs';

export function collectiveImageUrl(path, directory = 'collective') {
    if (typeof path !== 'string' || !path.trim()) return null;
    try {
        // CRA serves public/ at the UI root. Accept legacy API URLs and paths,
        // but always request the collective illustration from this UI deployment.
        const url = new URL(path.trim(), 'https://wordmage.app/');
        if (!['https:', 'http:'].includes(url.protocol)) return null;
        const pathname = url.pathname.replace(/^\/public\//, '/');
        return pathname.startsWith(`/${directory}/`) ? pathname : null;
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
        return { id: item.id, image_path: collectiveImageUrl(item.image_path ?? item.imagePath, 'collective-illustrations'), note: typeof item.note === 'string' ? item.note.trim() || null : null, interest_level: interestLevel(item.interest_level), hide_term: [true, 1, '1'].includes(item.hide_term), term: item.term, refersTo: item.refersTo, expression: item.expression, source: item.source,
            highlight: [true, 1, '1'].includes(item.highlight), categoryId: id };
    });
    return { records, collectives: combineCollectives(records), categories: [...categories.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id) };
}
