import React from 'react';
import FavoriteThumb from '../components/icons/FavoriteThumb.mjs';
import { collectives, collectiveKey } from './collective-data.mjs';
import { pages } from './pages.mjs';
import { PublicLinks, EditorialMasthead } from './PublicContent.mjs';
const h = React.createElement;
const highlights = collectives.filter(item => item.highlight);
const initialFeature = highlights.find(item => item.term.toLowerCase() === 'charm') || highlights[0] || collectives[0];
let rememberedFeature;
const favoritesStorageKey = 'wordmage.collective-favorites.v1';
function readFavorites(fallback = new Set()) {
    try {
        const saved = JSON.parse(localStorage.getItem(favoritesStorageKey));
        return new Set(Array.isArray(saved) ? saved.filter(key => typeof key === 'string') : fallback);
    } catch (_) { return new Set(fallback); }
}
const featureStorageKey = 'wordmage.collective-feature.v1';

function CollectiveOrnament() {
    return h('svg', { className: 'editorial-ornament', viewBox: '0 0 360 360', fill: 'none', stroke: 'currentColor', strokeWidth: 1, 'aria-hidden': true },
        h('circle', { cx: 180, cy: 180, r: 146 }),
        h('circle', { cx: 180, cy: 180, r: 116, strokeDasharray: '2 12' }),
        ...Array.from({ length: 7 }, (_, i) => {
            const angle = i * Math.PI * 2 / 7;
            return h('circle', { key: i, cx: 180 + 68 * Math.cos(angle), cy: 180 + 68 * Math.sin(angle), r: 42 });
        }), h('circle', { cx: 180, cy: 180, r: 10, fill: 'currentColor', opacity: .5 }));
}

function CollectiveLanding({ appHeader = false }) {
    const data = pages['/collective-nouns'];
    const [featured, setFeatured] = React.useState(initialFeature);
    const [search, setSearch] = React.useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('search') || '');
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
    const [onlyFavorites, setOnlyFavorites] = React.useState(false);
    React.useEffect(() => {
        let savedKey = rememberedFeature;
        try { savedKey = sessionStorage.getItem(featureStorageKey) || savedKey; } catch (_) { /* Private browsing may restrict storage. */ }
        const saved = collectives.find(item => collectiveKey(item) === savedKey);
        const next = saved || highlights[Math.floor(Math.random() * highlights.length)] || initialFeature;
        rememberedFeature = collectiveKey(next);
        try { sessionStorage.setItem(featureStorageKey, rememberedFeature); } catch (_) { /* Keep the in-memory selection. */ }
        setFeatured(next);
    }, []);
    const visible = React.useMemo(() => {
        const query = search.trim().toLowerCase();
        return collectives.filter(item => (!onlyFavorites || favorites.has(collectiveKey(item))) &&
            [item.term, item.refersTo, item.expression].some(value => value.toLowerCase().includes(query)))
            .sort((a, b) => a.refersTo.localeCompare(b.refersTo) || a.expression.localeCompare(b.expression));
    }, [search, onlyFavorites, favorites]);

    return h('div', { className: 'editorial-landing editorial-collective', style: { '--collective-sticky-top': appHeader ? '50px' : '64px' } },
        !appHeader ? h(EditorialMasthead, { page: '/collective-nouns' }) : null,
        h('main', null,
            h('section', { className: 'editorial-hero', 'aria-labelledby': 'landing-title' },
                h('div', { className: 'editorial-hero-inner' },
                    h('div', { className: 'editorial-hero-copy' },
                        h('h1', { id: 'landing-title' }, data.lead, ' ', h('em', null, data.accent)),
                        h('p', { className: 'editorial-hero-description' }, data.intro)),
                    h('aside', { className: 'editorial-feature', 'aria-label': 'Featured collective noun' },
                        h(CollectiveOrnament),
                        h('div', { className: 'editorial-feature-content' },
                            h('p', { className: 'editorial-feature-label' }, 'In good company'),
                            h('p', { className: 'editorial-feature-word' }, featured.term),
                            h('p', { className: 'editorial-feature-definition' }, featured.expression),
                            h('p', { className: 'editorial-feature-source' }, 'Collection source: ', featured.sources.join('; ')))))),
            h('section', { className: 'editorial-collection', id: 'collection', 'aria-labelledby': 'collection-title' },
                h('div', { className: 'editorial-collection-header' }, h('div', { className: 'editorial-section-heading' },
                    h('p', { className: 'editorial-eyebrow' }, 'Creatures, people, and things'),
                    h('h2', { id: 'collection-title' }, data.collectionTitle), h('p', null, data.collectionIntro))),
                h('div', { className: 'collective-controls', role: 'group', 'aria-label': 'Filter collective nouns' },
                    h('div', { className: 'collective-search' },
                        h('input', { type: 'search', 'aria-label': 'Find an expression', value: search, placeholder: 'Search', onChange: event => setSearch(event.target.value) }),
                        h('svg', { className: 'collective-search-icon', viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
                            h('circle', { cx: 10.5, cy: 10.5, r: 6.5 }), h('path', { d: 'm16 16 5 5' }))),
                    h('button', { type: 'button', className: 'collective-favorites-filter', 'aria-pressed': onlyFavorites, onClick: () => setOnlyFavorites(value => !value) }, onlyFavorites ? 'All' : 'Favorites')),
                h('ul', { className: 'collective-list', 'aria-label': 'Collective noun expressions' }, visible.map(item =>
                    h('li', { key: collectiveKey(item) },
                        h('button', { type: 'button', className: 'word-favorite-toggle',
                            'aria-label': `${favorites.has(collectiveKey(item)) ? 'Unfavorite' : 'Favorite'} ${item.expression}`,
                            'aria-pressed': favorites.has(collectiveKey(item)),
                            title: 'Favorite saved in this browser', onClick: () => toggleFavorite(item) },
                            h(FavoriteThumb, { filled: favorites.has(collectiveKey(item)) })),
                        h('span', { className: 'word-item-word word-item-word-no-after' }, item.expression)))),
                !visible.length ? h('p', null, 'No expressions found. Try another search, or switch from Favorites to All.') : null,
                h('section', { className: 'collective-source-note', 'aria-labelledby': 'collective-about-title' },
                    h('h2', { id: 'collective-about-title' }, 'About this collection'),
                    h('p', null, 'These expressions come from the collection’s records labelled Lipton 1977 and Book of St. Albans. They include historical and fanciful group names. Source labels are preserved; individual usage histories have not been assessed. Favorites are saved only in this browser.'))),
            h('section', { className: 'editorial-next', 'aria-labelledby': 'explore-title' },
                h('p', { className: 'editorial-eyebrow' }, 'Follow your curiosity'),
                h('h2', { id: 'explore-title' }, 'There’s always another word.'), h(PublicLinks))));
}
export { CollectiveLanding };
