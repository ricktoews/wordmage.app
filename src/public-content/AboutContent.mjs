// Author's About text, restored from the version preceding the SEO changes.
import React from 'react';
const h = React.createElement;

function AboutContent() {
    return h('main', { className: 'public-content about-restored' },
        h('h1', { className: 'public-eyebrow' }, 'About WordMage'),
        h('p', null, h('i', null, 'wordmage.app'), ' is designed for a mobile device and is intended as entertainment for word fanciers. It contains a collection of several thousand off-the-beaten-path words that are more likely to hold recreational appeal for the logophile than to be of practical use in building an everyday vocabulary.'),
        h('p', null, 'There are several sections.'),
        h('p', null, 'The ', h('b', null, 'Browse'), ' section contains all of the words in the collection, in dictionary order.'),
        h('p', null, 'Each word entry includes a three-dot menu with options to favorite words you like, mark them for learning, or add tags for organizing your collection.'),
        h('p', null, 'The ', h('b', null, 'Favorites'), " list ... Yeah, you're wondering what that could be, aren't you?"),
        h('p', null, 'The ', h('b', null, 'Random'), " list is a random selection of words from the Browse list, but not arranged in any order. It's meant to give you a quick sampling of words you're not likely to have just seen and gotten bored with."),
        h('p', null, 'The ', h('b', null, 'Learn'), " section contains words you've marked for learning or practice."),
        h('p', null, 'The ', h('b', null, 'Unscramble'), ' game challenges you to unscramble words from your Learn list.'),
        h('p', null, 'The ', h('b', null, 'Collective Nouns'), " section is a curated collection of collective nouns—you know, like a murder of crows or a parliament of owls. The venerable terms of venery are all from either St. Albans or a PDF version of the 1977 edition of James Lipton's ", h('i', null, 'An Exaltation of Larks'), '. I had ChatGPT extract the terms from St. Albans and Gemini handle the Exaltation of Larks.'),
        h('hr'), h('h2', null, 'Source'),
        h('p', null, h('b', null, 'Luciferous Logolepsy'), ' (RIP). Most of the words included here were taken, as far I can tell, from an online resource titled ', h('i', null, 'Luciferous Logolepsy'), ", which no longer exists. Years ago—at least a decade, I think—I created a database table of words and populated it with roughly 9,000 worthy specimens. I don't recall exactly where I got the words; however, when I compare entries with those at ", h('i', null, 'Cafe Arcane'), ' (', h('i', null, 'arcane.org/luciferous-logolepsy/'), '), I find several convincing indications of a common source.'),
        h('p', null, "Since what I believe to have been my original source no longer exists, I feel more free than I otherwise might to use the list without getting someone's permission."));
}
export { AboutContent };
