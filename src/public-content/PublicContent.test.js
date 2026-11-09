import { render, screen, fireEvent } from '@testing-library/react';
import { PublicContent } from './PublicContent';
import snapshot from './landing-snapshot.json';
import { pageForPath } from './pages';
import { combineCollectives, CollectiveCollection } from './CollectiveCollection.draft.mjs';

test('public pages provide descriptive headings and crawlable paths into the app', () => {
    render(<PublicContent page="/rare-words" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Rare words');
    expect(screen.queryByRole('link', { name: /Surprise me|Find a word/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /word generator/i })).not.toBeInTheDocument();
    expect(screen.getByText(snapshot.rare[1].word)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Random words' })[0]).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('link', { name: 'Browse words' })[0]).toHaveAttribute('href', '/browse');
});

test('collective nouns search subjects and merge duplicate sources without losing highlights', () => {
    const item = { term: 'charm', refersTo: 'goldfinches', expression: 'a charm of goldfinches', source: 'First', highlight: false };
    const merged = combineCollectives([item, { ...item, source: 'Second', highlight: true }]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toEqual(expect.objectContaining({ sources: ['First', 'Second'], highlight: true }));
    render(<CollectiveCollection />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'goldfinches' } });
    expect(screen.getByRole('status')).toHaveTextContent('expressions shown');
    expect(screen.getAllByRole('heading', { level: 3 }).every(heading => /goldfinches/i.test(heading.textContent))).toBe(true);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'no-match-xyz' } });
    expect(screen.getByRole('status')).toHaveTextContent('0 expressions');
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
});

test('canonical aliases, private routes, and missing pages have distinct metadata policies', () => {
    expect(pageForPath('/collective-nouns').noindex).toBe(true);
    expect(pageForPath('/random/').path).toBe('/');
    expect(pageForPath('/rare-word-generator').title).toBe('Page Not Found | WordMage');
    expect(pageForPath('/rare-words/').path).toBe('/rare-words');
    expect(pageForPath('/albums/123').noindex).toBe(true);
    expect(pageForPath('/browse/c').noindex).toBe(true);
    expect(pageForPath('/rare-words/not-a-page').title).toBe('Page Not Found | WordMage');
});

test('Gothic landing introduces API-sourced words without invented categories or examples', () => {
    render(<PublicContent page="/gothic-vocabulary" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gothic words');
    expect(screen.getByRole('complementary', { name: 'Featured word' })).toHaveTextContent(snapshot.gothic[0].word);
    expect(screen.queryByRole('link', { name: /Enter collection/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Gothic word categories' })).not.toBeInTheDocument();
    expect(screen.getByText(snapshot.gothic[1].word)).toBeInTheDocument();
});
