import { render, screen, fireEvent, within } from '@testing-library/react';
import { PublicContent } from './PublicContent';
import snapshot from './landing-snapshot.json';
import { pageForPath } from './pages';
import { combineCollectives } from './collective-data.mjs';
import { CollectiveLanding } from './CollectiveLanding.mjs';

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
    render(<CollectiveLanding />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'goldfinches' } });
    expect(within(screen.getByRole('list', { name: 'Collective noun expressions' })).getAllByRole('listitem')).toHaveLength(1);
    expect(within(screen.getByRole('list', { name: 'Collective noun expressions' })).getAllByRole('listitem').every(entry => /goldfinches/i.test(entry.textContent))).toBe(true);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'no-match-xyz' } });
    expect(screen.getByText(/No expressions found/)).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Collective noun expressions' })).queryByRole('listitem')).not.toBeInTheDocument();
});

test('canonical aliases, private routes, and missing pages have distinct metadata policies', () => {
    expect(pageForPath('/collective-nouns').path).toBe('/collective-nouns');
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

test('collective landing retains the featured expression across navigation and clears filters', () => {
    const first = render(<CollectiveLanding />);
    const feature = screen.getByRole('complementary', { name: 'Featured collective noun' }).textContent;
    first.unmount();
    render(<CollectiveLanding />);
    expect(screen.getByRole('complementary', { name: 'Featured collective noun' }).textContent).toBe(feature);
    fireEvent.click(screen.getByRole('button', { name: /^Favorite a charm of goldfinches$/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Favorites' }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '  GOLDFINCHES  ' } });
    expect(within(screen.getByRole('list', { name: 'Collective noun expressions' })).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Show all' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Favorites' })).toHaveAttribute('aria-pressed', 'false');
    expect(within(screen.getByRole('list', { name: 'Collective noun expressions' })).getAllByRole('listitem')).toHaveLength(447);
    expect(screen.getByRole('heading', { name: 'About this collection' })).toBeInTheDocument();
    expect(screen.getByText(/individual usage histories have not been assessed/)).toBeVisible();
});

test('landing cards and their featured word omit supplied examples', () => {
    render(<PublicContent page="/rare-words" landingWords={[
        { id: 1, word: 'first specimen', def: 'First meaning.', examples: [{ sentence: 'The first specimen appeared.', source: 'AI-generated' }] },
        { id: 2, word: 'second specimen', def: 'Second meaning.', examples: [{ sentence: 'The second specimen followed.', source: 'AI-generated' }, { sentence: 'Not shown.' }] }
    ]} />);
    expect(screen.getByRole('complementary')).not.toHaveTextContent('The first specimen appeared.');
    expect(screen.queryByText('The second specimen followed.')).not.toBeInTheDocument();
    expect(screen.queryByText('Not shown.')).not.toBeInTheDocument();
});
