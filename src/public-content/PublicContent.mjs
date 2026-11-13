import React from 'react';
import { AboutContent } from './AboutContent.mjs';
import { pages } from './pages.mjs';
import words from './words.mjs';
const h = React.createElement;
const byWord = Object.fromEntries(words.map(word => [word.word.toLowerCase(), word]));

const context = {
    apricity: 'A word for a small winter pleasure: sunshine that you can feel.',
    petrichor: 'A particular scent, rather than a general word for rain.',
    velleity: 'Useful when a wish never quite turns into a decision.',
    quiddity: 'A philosophical word for what makes something what it is.',
    clinquant: 'Its glitter can suggest showiness as well as brilliance.',
    luculent: 'An unusual way to describe an explanation that is easy to follow.',
    fugacious: 'A word for something that passes quickly.',
    abderian: 'An adjective to encounter with a smile; use it with its specific meaning in mind.'
};
const examples = {
    caliginous: 'The caliginous passage swallowed the light of the lantern.',
    crepuscular: 'Crepuscular light softened the edges of the ruined tower.',
    lambent: 'A lambent glow played across the chapel wall.',
    fuliginous: 'A fuliginous stain spread above the cold fireplace.',
    vespertine: 'The vespertine hush settled over the courtyard.',
    oubliette: 'From the opening of the oubliette came a faint tapping.',
    clerestory: 'Moonlight entered through the clerestory high above the nave.',
    abditory: 'Behind the panel she found an abditory for letters.',
    eldritch: 'An eldritch cry rose from the empty stairwell.',
    chthonic: 'The carvings depicted chthonic deities beneath a field of stars.',
    oneiric: 'An oneiric procession moved through the rooms of her memory.',
    weltschmerz: 'His journal was steeped in Weltschmerz, a sorrow at the state of the world.'
};

function PublicLinks() {
    const links = [['/', 'Random words'], ['/rare-words', 'Rare words'], ['/gothic-vocabulary', 'Gothic vocabulary'], ['/collective-nouns', 'Collective nouns'], ['/browse', 'Browse words'], ['/about', 'About WordMage']];
    return h('nav', { className: 'public-links', 'aria-label': 'Explore WordMage' },
        links.map(([href, label]) => h('a', { href, key: href, 'data-public-link': true }, label)));
}

function WordCards({ names = [], gothic = false, entries }) {
    if (entries) return h('dl', { className: 'public-word-grid' }, entries.map(word =>
        h('div', { className: 'public-word-card', key: word.id },
            h('dt', null, word.word), h('dd', null, h('p', null, word.def),
                word.source ? h('small', null, 'Collection source: ', word.source) : null))));
    return h('dl', { className: 'public-word-grid' }, names.map(name => {
        const word = byWord[name];
        return h('div', { className: 'public-word-card', key: name },
            h('dt', null, word.word),
            h('dd', null, h('p', null, word.def),
                context[name] && !gothic ? h('p', { className: 'public-word-context' }, context[name]) : null,
                gothic ? h('p', { className: 'public-word-example' }, examples[name]) : null,
                h('small', null, 'Collection source: ', word.source),
                gothic && ['eldritch', 'caliginous', 'oubliette', 'clerestory', 'chthonic', 'oneiric'].includes(name)
                    ? h('a', { className: 'public-reference', href: `https://www.merriam-webster.com/dictionary/${name}` }, 'Dictionary reference') : null));
    }));
}

function MenuIcon() {
    return h('svg', { viewBox: '0 0 24 24', width: 24, height: 24, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, 'aria-hidden': true },
        h('path', { d: 'M3 6h18M3 12h18M3 18h18' }));
}

function EditorialMenu({ currentPath, onNavigate }) {
    const links = [['/', 'Random words', '↝'], ['/rare-words', 'Rare words', 'Aa'], ['/gothic-vocabulary', 'Gothic vocabulary', '☾'], ['/collective-nouns', 'Collective nouns', '⋮'], ['/browse', 'Browse words', 'A–Z'], ['/about', 'About WordMage', '?']];
    return h('ul', { className: 'editorial-menu-links' }, links.map(([href, label, glyph]) =>
        h('li', { key: href }, h('a', { href, 'data-public-link': true, onClick: onNavigate, 'aria-current': currentPath === href ? 'page' : undefined },
            h('span', { className: 'editorial-menu-glyph', 'aria-hidden': true }, glyph), h('span', null, label)))));
}

function EditorialMasthead({ onMenuToggle, menuOpen, page }) {
    const menu = onMenuToggle
        ? h('button', { type: 'button', className: 'hamburger-icon editorial-menu-toggle', 'data-landing-menu-toggle': true, onClick: onMenuToggle, 'aria-label': 'Open navigation menu', 'aria-expanded': menuOpen }, h(MenuIcon))
        : h('details', { className: 'editorial-native-menu' },
            h('summary', { 'aria-label': 'Open navigation menu' }, h(MenuIcon)), h(EditorialMenu, { currentPath: page }));
    return h('header', { className: 'editorial-masthead' }, menu,
        h('a', { className: 'editorial-wordmark', href: '/', 'data-public-link': true },
            h('img', { src: '/images/wordmage-logo.png', width: 30, height: 30, alt: '' }), 'WordMage'),
        h('a', { className: 'editorial-browse', href: '/browse', 'data-public-link': true }, 'Browse ', h('span', { 'aria-hidden': true }, '↗')));
}

function WordOrnament({ gothic }) {
    return h('svg', { className: 'editorial-ornament', viewBox: '0 0 360 400', fill: 'none', stroke: 'currentColor', strokeWidth: 1, 'aria-hidden': true, focusable: false },
        gothic ? h(React.Fragment, null,
            h('path', { d: 'M40 390V184C40 86 104 40 180 8c76 32 140 78 140 176v206M64 390V188C64 106 114 64 180 34c66 30 116 72 116 154v202M88 390V192C88 126 126 88 180 60c54 28 92 66 92 132v198M180 60v96' }),
            h('path', { d: 'M225 92a32 32 0 1 1-43-43 27 27 0 0 0 43 43Z', fill: 'currentColor', stroke: 'none', opacity: .5 }))
            : h(React.Fragment, null,
                h('circle', { cx: 180, cy: 192, r: 150 }), h('circle', { cx: 180, cy: 192, r: 120 }),
                h('path', { d: 'M180 20v32M180 332v32M8 192h32M320 192h32M58 70l23 23M279 291l23 23M58 314l23-23M279 93l23-23' }),
                h('text', { x: 180, y: 246, textAnchor: 'middle', fill: 'currentColor', stroke: 'none', fontSize: 160, fontFamily: 'Georgia, serif', opacity: .22 }, 'æ')));
}

function EditorialLanding({ page, onMenuToggle, menuOpen, landingWords = [], onRefresh, selectionLoading, selectionError, appHeader, wordCards }) {
    const data = pages[page];
    const design = data.landing;
    const featured = landingWords[0];
    const gothic = design.tone === 'gothic';
    return h('div', { className: `editorial-landing editorial-${design.tone}` },
        !appHeader ? h(EditorialMasthead, { onMenuToggle, menuOpen, page }) : null,
        h('main', null,
            h('section', { className: 'editorial-hero', 'aria-labelledby': 'landing-title' },
                h('div', { className: 'editorial-hero-inner' },
                    h('div', { className: 'editorial-hero-copy' },
                        h('h1', { id: 'landing-title' }, design.lead, ' ', h('em', null, design.accent)),
                        h('p', { className: 'editorial-hero-description' }, design.introduction)),
                    featured ? h('aside', { className: 'editorial-feature', 'aria-label': 'Featured word' },
                        h(WordOrnament, { gothic }),
                        h('div', { className: 'editorial-feature-content' },
                            h('p', { className: 'editorial-feature-label' }, design.featuredLabel),
                            h('p', { className: 'editorial-feature-word' }, featured.word),
                            h('p', { className: 'editorial-feature-definition' }, featured.def),
                            h('p', { className: 'editorial-feature-source' }, 'From the WordMage collection', featured.source ? ` · ${featured.source}` : ''))) : null)),
            h('section', { className: 'editorial-collection', id: 'collection', 'aria-labelledby': 'collection-title' },
                h('div', { className: 'editorial-collection-header' },
                    h('div', { className: 'editorial-section-heading' },
                        h('p', { className: 'editorial-eyebrow' }, design.collectionLabel),
                        h('h2', { id: 'collection-title' }, design.collectionTitle), h('p', null, data.intro))),
                h('div', { className: 'editorial-word-band' }, wordCards || h('div', { className: `landing-app-cards album-content-page landing-editorial-cards landing-${gothic ? 'gothic' : 'rare'}-cards` },
                    h('div', { className: 'word-list-scroller' }, landingWords.slice(1).map(word =>
                        h('div', { className: 'word-item-container', key: word.id },
                            h('article', { className: 'word-item' }, h('div', { className: 'word-content-wrapper' },
                                h('div', { className: 'word-item-word-container' },
                                    h('strong', { className: 'word-item-word word-item-word-no-after' }, word.word),
                                    h('span', { className: 'word-item-sep' }, '. '),
                                    h('div', { className: 'word-item-def' }, word.def))))))))),
                h('p', { className: 'editorial-closing' }, data.closing),
                onRefresh ? h('div', { className: 'editorial-selection-controls' },
                    h('button', { type: 'button', className: 'editorial-refresh', onClick: onRefresh, disabled: selectionLoading, 'aria-describedby': 'selection-refresh-help' },
                        h('svg', { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
                            h('path', { d: 'M20 7v5h-5M4 17v-5h5M5.4 8a7 7 0 0 1 11.5-2.2L20 9M4 15l3.1 3.2A7 7 0 0 0 18.6 16' })),
                        selectionLoading ? 'Loading new words…' : 'Show different words'),
                    h('p', { id: 'selection-refresh-help' }, 'Refreshes the featured word and this collection.')) : null,
                onRefresh ? h('p', { className: 'editorial-selection-status', role: 'status', 'aria-live': 'polite' }, selectionError || '') : null),
            h('section', { className: 'editorial-next', 'aria-labelledby': 'explore-title' },
                h('p', { className: 'editorial-eyebrow' }, 'Follow your curiosity'),
                h('h2', { id: 'explore-title' }, 'There’s always another word.'),
                h(PublicLinks))));
}

function PublicContent({ page = '/', embedded = false, onMenuToggle, menuOpen, landingWords, onRefresh, selectionLoading, selectionError, appHeader, wordCards }) {
    if (pages[page]?.landing) return h(EditorialLanding, { page, onMenuToggle, menuOpen, landingWords, onRefresh, selectionLoading, selectionError, appHeader, wordCards });
    if (embedded && page === '/') {
        const data = pages[page];
        // These examples are replaced by the existing shared random-list engine.
        return h('main', null,
            h('header', { className: 'public-content random-static-heading' }, h('h1', null, data.heading), h('p', null, data.intro)),
            h('section', { className: 'public-content random-static-samples', 'aria-label': 'Example rare words' },
                h('h2', null, data.note), h(WordCards, { names: data.words })),
            h('footer', { className: 'public-content random-static-samples' }, h(PublicLinks)));
    }
    if (page === '/about') return h(AboutContent);
    if (page === '/browse') return h('main', { className: 'public-content' },
        h('h1', null, 'Browse'), h(WordCards, { names: pages[page].words }));
    const data = pages[page] || pages['/404'];
    const sample = data.words ? h(WordCards, { names: data.words }) : null;
    return h(embedded ? 'section' : 'main', { className: `public-content${embedded ? ' public-content-embedded' : ''}` },
        h('header', { className: 'public-intro' },
            h('p', { className: 'public-eyebrow' }, data.eyebrow), h('h1', null, data.heading), h('p', null, data.intro)),
        page !== '/browse' ? h(PublicLinks) : null,
        sample ? (embedded ? h('details', { className: 'public-samples' }, h('summary', null, data.note), sample) :
            h('section', null, h('h2', null, data.note), sample)) : null,
        data.sections ? h(React.Fragment, null,
            h('p', { className: 'public-editorial-note' }, 'Meanings below come from the existing collection. The example sentences are original illustrations, not quotations from literature.'),
            data.sections.map(section => h('section', { key: section.heading }, h('h2', null, section.heading), h(WordCards, { names: section.words, gothic: true })))) : null,
        data.closing ? h('p', { className: 'public-closing' }, data.closing) : null,
        !embedded ? h('footer', null, h('h2', null, 'Keep exploring'), h(PublicLinks)) : null);
}

export { PublicContent, PublicLinks, WordCards, EditorialMenu, EditorialMasthead };
