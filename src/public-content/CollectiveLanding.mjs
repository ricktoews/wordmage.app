import React from 'react';
import FavoriteThumb from '../components/icons/FavoriteThumb.mjs';
import { categories, collectives, collectiveKey, compareCollectives } from './collective-data.mjs';
import { pages } from './pages.mjs';
import { PublicLinks, EditorialMasthead, PublicContent } from './PublicContent.mjs';
const h = React.createElement;
const favoritesStorageKey = 'wordmage.collective-favorites.v1';
function readFavorites(fallback = new Set()) {
    try {
        const saved = JSON.parse(localStorage.getItem(favoritesStorageKey));
        return new Set(Array.isArray(saved) ? saved.filter(key => typeof key === 'string') : fallback);
    } catch (_) { return new Set(fallback); }
}

function CollectiveOrnament() {
    return h('svg', { className: 'editorial-ornament', viewBox: '0 0 360 360', fill: 'none', stroke: 'currentColor', strokeWidth: 1, 'aria-hidden': true },
        h('circle', { cx: 180, cy: 180, r: 146 }),
        h('circle', { cx: 180, cy: 180, r: 116, strokeDasharray: '2 12' }),
        ...Array.from({ length: 7 }, (_, i) => {
            const angle = i * Math.PI * 2 / 7;
            return h('circle', { key: i, cx: 180 + 68 * Math.cos(angle), cy: 180 + 68 * Math.sin(angle), r: 42 });
        }), h('circle', { cx: 180, cy: 180, r: 10, fill: 'currentColor', opacity: .5 }));
}

function CollectiveLanding({ appHeader = false, collection, loadError = '', categorySlug }) {
    const entries = collection?.collectives || collectives;
    const categoryList = collection?.categories || categories;
    const category = categorySlug ? categoryList.find(item => item.slug === categorySlug) : null;
    const data = pages['/collective-nouns'];
    const [favorites, setFavorites] = React.useState(() => new Set());
    React.useEffect(() => {
        setFavorites(readFavorites());
        const sync = event => {
            if (event.key === favoritesStorageKey || event.key === null) setFavorites(readFavorites());
        };
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, []);
    function toggleFavorite(item) {
        const key = collectiveKey(item);
        // Read storage again so changes in another tab are not overwritten.
        const next = readFavorites(favorites);
        if (next.has(key)) next.delete(key); else next.add(key);
        try { localStorage.setItem(favoritesStorageKey, JSON.stringify([...next])); }
        catch (_) { /* Keep the selection for this visit when storage is unavailable. */ }
        setFavorites(next);
    }
    const visible = React.useMemo(() => entries.filter(item => !categorySlug || item.categoryId === category?.id)
        .sort(compareCollectives),
    [entries, categorySlug, category?.id]);

    const sections = categoryList.map(category => ({ ...category, entries: visible.filter(item => item.categoryId === category.id) }))
        .filter(category => category.entries.length);

    if (categorySlug && !category) return h(PublicContent, { page: '/404' });

    return h('div', { className: `editorial-landing editorial-collective${category ? ' collective-category-page' : ''}`, style: { '--collective-sticky-top': appHeader ? '50px' : '64px' } },
        !appHeader ? h(EditorialMasthead, { page: '/collective-nouns' }) : null,
        h('main', null,
            category ? h('header', { className: 'collective-category-intro' },
                h('a', { href: '/collective-nouns', 'data-public-link': true }, '← All collective nouns'),
                h('h1', { className: category.imagePath ? 'collective-accessible-title' : undefined }, category.name),
                category.imagePath ? h('img', { className: 'collective-category-image', src: category.imagePath, alt: '', decoding: 'async' }) : null,
                category.description ? h('p', null, category.description) : null) :
            h('section', { className: 'editorial-hero', 'aria-labelledby': 'landing-title' },
                h('div', { className: 'editorial-hero-inner' },
                    h('div', { className: 'editorial-hero-copy' },
                        h('h1', { id: 'landing-title' }, data.lead, ' ', h('em', null, data.accent)),
                        h('p', { className: 'editorial-hero-description' }, data.intro)),
                    h('div', { className: 'editorial-feature', 'aria-hidden': true }, h(CollectiveOrnament)))),
            h('section', { className: 'editorial-collection', id: 'collection', 'aria-labelledby': category ? undefined : 'collection-title', 'aria-label': category ? 'Category collection' : undefined },
                !category ? h('div', { className: 'editorial-collection-header' }, h('div', { className: 'editorial-section-heading' },
                    h('p', { className: 'editorial-eyebrow' }, 'Creatures, people, and things'),
                    h('h2', { id: 'collection-title' }, category ? 'Explore the expressions' : data.collectionTitle), !category ? h('p', null, data.collectionIntro) : null)) : null,
                loadError ? h('p', { role: 'status' }, loadError) : null,
                !category ? h('nav', { className: 'collective-category-index', 'aria-label': 'Collective noun categories' },
                    categoryList.map(item => h('a', { key: item.id, href: `/collective-nouns/${item.slug}`, 'data-public-link': true,
                        'aria-label': item.name },
                        !item.imagePath ? h('span', { className: 'collective-category-name' }, item.name) : null,
                        item.imagePath ? h('img', { className: 'collective-category-image', src: item.imagePath, alt: '', loading: 'lazy', decoding: 'async',
                            onError: event => { event.currentTarget.hidden = true; } }) : null,
                        item.description ? h('span', { className: 'collective-category-description' }, item.description) : null))) :
                h('div', { role: 'region', 'aria-label': 'Collective noun expressions' }, sections.map(category =>
                    h('section', { className: 'collective-category', key: category.id, 'aria-label': category.name },
                        h('ul', { className: 'collective-list', 'aria-label': category.name }, category.entries.map(item =>
                    h('li', { key: collectiveKey(item) },
                        h('button', { type: 'button', className: 'word-favorite-toggle',
                            'aria-label': `${favorites.has(collectiveKey(item)) ? 'Unfavorite' : 'Favorite'} ${item.expression}`,
                            'aria-pressed': favorites.has(collectiveKey(item)),
                            title: 'Favorite saved in this browser', onClick: () => toggleFavorite(item) },
                            h(FavoriteThumb, { filled: favorites.has(collectiveKey(item)) })),
                        h('span', { className: 'collective-expression-copy' },
                            h('span', { className: 'word-item-word word-item-word-no-after' }, item.expression),
                            h('small', { className: 'collective-expression-source' }, `(${item.sources.join('; ')})`),
                            item.image_path ? h('img', { className: 'collective-expression-image', src: item.image_path, alt: '', loading: 'lazy', decoding: 'async',
                                onError: event => { event.currentTarget.hidden = true; } }) : null,
                            item.notes?.map(note => h('span', { className: 'collective-expression-note', key: note }, note))))))))),
                category && !visible.length ? h('p', null, 'No expressions in this category yet.') : null,
                h('section', { className: 'collective-source-note', 'aria-labelledby': 'collective-about-title' },
                    h('h2', { id: 'collective-about-title' }, 'About this collection'),
                    h('p', null, 'These expressions come from the collection’s records labelled Lipton 1977 and Book of St. Albans. They include historical and fanciful group names. Source labels are preserved; individual usage histories have not been assessed. Favorites are saved only in this browser.'))),
            h('section', { className: 'editorial-next', 'aria-labelledby': 'explore-title' },
                h('p', { className: 'editorial-eyebrow' }, 'Follow your curiosity'),
                h('h2', { id: 'explore-title' }, 'There’s always another word.'), h(PublicLinks))));
}
export { CollectiveLanding };
