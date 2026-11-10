import React from 'react';
import { collectives, collectiveKey } from './collective-data.mjs';
import { pages } from './pages.mjs';
import { PublicLinks, EditorialMasthead } from './PublicContent.mjs';
const h = React.createElement;
const highlights = collectives.filter(item => item.highlight);
const initialFeature = highlights.find(item => item.term.toLowerCase() === 'charm') || highlights[0] || collectives[0];
let rememberedFeature;
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
    const [sort, setSort] = React.useState('subject');
    const [onlyHighlights, setOnlyHighlights] = React.useState(false);
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
        return collectives.filter(item => (!onlyHighlights || item.highlight) &&
            [item.term, item.refersTo, item.expression].some(value => value.toLowerCase().includes(query)))
            .sort((a, b) => (sort === 'term' ? a.term.localeCompare(b.term) : a.refersTo.localeCompare(b.refersTo)) || a.expression.localeCompare(b.expression));
    }, [search, sort, onlyHighlights]);

    return h('div', { className: 'editorial-landing editorial-collective' },
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
                h('div', { className: 'collective-controls' },
                    h('label', { className: 'collective-search' }, 'Find an expression',
                        h('input', { type: 'search', value: search, placeholder: 'Try goldfinches, ferrets, or charm', onChange: event => setSearch(event.target.value) })),
                    h('label', null, 'Browse by', h('select', { value: sort, onChange: event => setSort(event.target.value) },
                        h('option', { value: 'subject' }, 'Animal or subject'), h('option', { value: 'term' }, 'Collective term'))),
                    h('label', { className: 'collective-highlights' }, h('input', { type: 'checkbox', checked: onlyHighlights, onChange: event => setOnlyHighlights(event.target.checked) }), 'Collection favorites')),
                h('div', { className: 'collective-results-heading' },
                    h('p', { role: 'status', 'aria-live': 'polite' }, `${visible.length} ${visible.length === 1 ? 'expression' : 'expressions'}`),
                    search || onlyHighlights ? h('button', { type: 'button', onClick: () => { setSearch(''); setOnlyHighlights(false); } }, 'Show all') : null),
                h('details', { className: 'collective-source-note' }, h('summary', null, 'About the collection'),
                    h('p', null, 'These expressions come from the collection’s records labelled Lipton 1977 and Book of St. Albans. They include historical and fanciful group names. Source labels are preserved; individual usage histories have not been assessed. “Collection favorites” marks selected expressions, not evidence of common usage.')),
                h('div', { className: 'public-word-grid collective-grid' }, visible.map(item =>
                    h('article', { className: 'public-word-card', key: collectiveKey(item) },
                        h('h3', null, item.expression), h('p', { className: 'collective-subject' }, item.refersTo),
                        h('small', null, 'Collection source: ', item.sources.join('; '))))),
                !visible.length ? h('p', null, 'No expressions found. Try another subject, or choose “Show all”.') : null),
            h('section', { className: 'editorial-next', 'aria-labelledby': 'explore-title' },
                h('p', { className: 'editorial-eyebrow' }, 'Follow your curiosity'),
                h('h2', { id: 'explore-title' }, 'There’s always another word.'), h(PublicLinks))));
}
export { CollectiveLanding };
