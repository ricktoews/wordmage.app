// Shared by React and the build-time HTML generator. No browser or API dependency.
const origin = 'https://wordmage.app';
const pages = {
    '/': {
        title: 'Random Words — Explore Unusual English Vocabulary | WordMage',
        description: 'Explore a fresh selection of unusual English words and their meanings. Refresh Random, browse the collection, or discover WordMage’s vocabulary guides.',
        heading: 'Random',
        intro: 'Explore a fresh selection of unusual English words and their meanings.',
        note: 'A few words from the collection',
        words: ['apricity', 'petrichor', 'velleity', 'sidereal']
    },
    '/rare-words': {
        title: 'Rare English Words and Their Meanings | WordMage',
        description: 'Explore rare English words and their meanings: distinctive, obscure verbal curiosities collected for the pleasure of logophiles.',
        heading: 'Rare words. Lexical curiosities.',
        landing: {
            tone: 'curiosity', lead: 'Rare words.', accent: 'Lexical curiosities.',
            introduction: 'Specimens off the beaten path.',
            featuredLabel: 'A word worth discovering',
            collectionLabel: 'A cabinet of verbal curiosities',
            collectionTitle: 'Museum words.'
        },
        eyebrow: 'A cabinet of verbal curiosities',
        intro: 'Distinctive, often obscure specimens of English, collected for the pleasure of knowing them. Their sound, shape, or unusual meaning earns them a place in a logophile’s cabinet.',
        closing: 'There is always another curious word around the corner. Browse the collection, or let Random choose your next discovery.'
    },
    '/gothic-vocabulary': {
        title: 'Gothic Words — Dark and Curious Vocabulary | WordMage',
        description: 'Explore the darker side of English: strange, haunting, and curious Gothic words and their meanings, collected for the pleasure of word lovers.',
        heading: 'Gothic words. Dark discoveries.',
        landing: {
            tone: 'gothic', lead: 'Gothic words.', accent: 'Dark discoveries.',
            introduction: 'Words for shadowed places, strange encounters, and a haunted imagination.',
            featuredLabel: 'From the darker side of English',
            collectionLabel: 'A lexicon of light and shadow',
            collectionTitle: 'Curiosities from the shadows.'
        },
        intro: 'A gathering of the strange, the haunting, and the wonderfully obscure. Explore the darker corners of English, simply for the pleasure of the words themselves.',
        closing: 'Follow a word that catches your eye, or explore another selection from the darker side of the collection.',

    },
    '/collective-nouns': {
        title: 'Collective Nouns — Curious Names for Animals, People and Things | WordMage',
        description: 'Explore unusual collective nouns for animals, birds, people and things. Browse curious expressions, search by subject, and discover the collection’s favorites.',
        heading: 'Collective nouns. Curious company.',
        lead: 'Collective nouns.', accent: 'Curious company.',
        intro: 'The peculiar pleasure of naming a group.',
        collectionTitle: 'An assembly of curiosities.',
        collectionIntro: 'A business of ferrets, a charm of goldfinches: curious names for company, collected for the pleasure of finding them.'
    },
    '/browse': {
        title: 'Browse Unusual English Words and Meanings | WordMage',
        description: 'Browse WordMage’s unusual English vocabulary alphabetically. Jump to a starting letter, explore definitions, and discover words worth remembering.',
        heading: 'Browse',
        words: ['abderian', 'abditory', 'fugacious']
    },
    '/about': {
        title: 'About WordMage — A Collection for Word Lovers',
        description: 'WordMage is entertainment for word fanciers: several thousand off-the-beaten-path words with recreational appeal for the logophile.',
        heading: 'About WordMage'
    },
    '/404': {
        title: 'Page Not Found | WordMage',
        description: 'This WordMage page could not be found. Discover rare words or browse the public vocabulary collection.',
        heading: 'This page has wandered off.',
        eyebrow: '404 — Page not found',
        intro: 'There is no page at this address. Follow one of the links below to discover a word instead.',
        noindex: true
    }
};

const appRoutes = [
    '/mock', '/albums', '/albums/:id', '/shared/albums/:token', '/history', '/new-words',
    '/inbox', '/connect-assistant', '/settings', '/login', '/register',
    '/what-to-train', '/training-room', '/unscramble', '/unscramble/:word',
    '/unscramble/:word/:def', '/browse/:start'
];

function pageForPath(pathname) {
    const path = pathname.replace(/\/+$/, '') || '/';
    if (path === '/mock') return { title: 'Header Design Preview | WordMage', description: 'WordMage design preview.', noindex: true, path: null };
    if (/^\/collective(?:\/[^/]+)?$/.test(path)) return { ...pages['/collective-nouns'], path: '/collective-nouns' };
    if (path === '/random') return { ...pages['/'], path: '/' };
    if (pages[path] && !pages[path].deferred) return { ...pages[path], path };
    if (appRoutes.some(route => new RegExp(`^${route.replace(/:[^/]+/g, '[^/]+')}$`).test(path))) {
        return { title: 'Your WordMage Workspace', description: 'Your personal WordMage collections and tools.', noindex: true, path: null };
    }
    return { ...pages['/404'], path: null };
}

export { origin, pages, appRoutes, pageForPath };
