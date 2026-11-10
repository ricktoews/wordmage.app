// Unshipped draft retained for review; not imported by the application or builder.
import React from 'react';
import collectiveData from './collectives.mjs';
const h = React.createElement;

import { combineCollectives } from './collective-data.mjs';
const collectives = combineCollectives(collectiveData.records);

function CollectiveCollection() {
    const [search, setSearch] = React.useState('');
    const [sort, setSort] = React.useState('subject');
    const [highlights, setHighlights] = React.useState(false);
    React.useEffect(() => { setSearch(new URLSearchParams(window.location.search).get('search') || ''); }, []);
    const visible = collectives.filter(item => (!highlights || item.highlight) &&
        [item.term, item.refersTo, item.expression].some(value => value.toLowerCase().includes(search.toLowerCase())))
        .sort((a, b) => sort === 'term' ? a.term.localeCompare(b.term) : a.refersTo.localeCompare(b.refersTo));
    return h('section', { 'aria-labelledby': 'collective-list-title' },
        h('h2', { id: 'collective-list-title' }, 'Find a collective noun'),
        h('div', { className: 'public-collection-controls' },
            h('label', null, 'Animal, subject, or expression', h('input', { type: 'search', value: search, placeholder: 'Try crows, ferrets, or charm', onChange: event => setSearch(event.target.value) })),
            h('label', null, 'Sort by', h('select', { value: sort, onChange: event => setSort(event.target.value) }, h('option', { value: 'subject' }, 'Subject'), h('option', { value: 'term' }, 'Collective term'))),
            h('label', { className: 'public-checkbox' }, h('input', { type: 'checkbox', checked: highlights, onChange: event => setHighlights(event.target.checked) }), 'Highlights only')),
        h('p', { role: 'status' }, `${visible.length} expressions shown · ${collectiveData.records.length} source records`),
        h('ul', { className: 'public-collective-list' }, visible.map(item => h('li', { key: `${item.term}|${item.refersTo}|${item.expression}` },
            h('h3', null, item.expression), h('p', null, 'Subject: ', item.refersTo), h('small', null, 'Recorded in: ', item.sources.join('; '))))),
        !visible.length ? h('p', null, 'No expressions match. Try another subject or clear the highlights filter.') : null);
}

export { combineCollectives, CollectiveCollection };
