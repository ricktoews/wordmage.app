import { collectiveImageUrl, normalizeCollectiveResponse } from './collective-response.mjs';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CollectivePage from './CollectivePage';
import { CollectiveLanding } from './CollectiveLanding.mjs';
import { getCollectiveNouns } from '../utils/api';
jest.mock('../utils/api', () => ({ getCollectiveNouns: jest.fn() }));
const record = (id, name, expression) => ({ term: expression, refersTo: 'test subjects', expression, source: 'Test', highlight: false,
    category: { id, name, slug: `category-${id}`, sortOrder: id } });

test('loads live expressions and groups by category ID, preserving favorites', async () => {
    localStorage.clear();
    getCollectiveNouns.mockResolvedValueOnce([record(2, 'Second group', 'a second expression'), record(1, 'First group', 'a first expression')]);
    render(<CollectivePage appHeader categorySlug="category-1" />);
    await waitFor(() => expect(screen.getByText('a first expression')).toBeInTheDocument());
    expect([...document.querySelectorAll('.collective-category')].map(x => x.getAttribute('aria-label'))).toEqual(['First group']);
    expect(document.querySelectorAll('.collective-list > li')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Favorite a first expression' }));
    expect(document.querySelectorAll('.collective-category')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Unfavorite a first expression' })).toBeInTheDocument();
});

test('keeps the snapshot when the endpoint is unavailable or malformed', async () => {
    getCollectiveNouns.mockResolvedValueOnce({ invalid: true });
    render(<CollectivePage appHeader />);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Showing a saved collection'));
    expect(document.querySelectorAll('.collective-list > li')).toHaveLength(0);
});

test('hide_term excludes flagged records before source merging, while retaining visible duplicates', () => {
    const visible = record(1, 'First group', 'a visible expression');
    const data = normalizeCollectiveResponse([
        { ...visible, hide_term: null },
        { ...visible, source: 'Hidden source', hide_term: '1' },
        { ...record(1, 'First group', 'hidden numeric'), hide_term: 1 },
        { ...record(1, 'First group', 'hidden boolean'), hide_term: true },
        { ...record(1, 'First group', 'visible zero'), hide_term: '0' }
    ]);
    expect(data.collectives.map(item => item.expression)).toEqual(['a visible expression', 'visible zero']);
    expect(data.collectives[0].sources).toEqual(['Test']);
});

test('collective response retains interest_level including zero and missing values', () => {
    const data = normalizeCollectiveResponse([
        { ...record(1, 'First group', 'rated expression'), interest_level: 3 },
        { ...record(1, 'First group', 'zero expression'), interest_level: 0 },
        record(1, 'First group', 'unrated expression')
    ]);
    expect(data.records.map(item => item.interest_level)).toEqual([3, 0, null]);
    expect(data.collectives.find(item => item.expression === 'rated expression').interest_level).toBe(3);
});

test('display ranks visible entries by interest, with subject ordering for ties and unrated entries last', () => {
    const rows = [
        { ...record(1, 'First group', 'unrated'), refersTo: 'aardvarks' },
        { ...record(1, 'First group', 'zero'), interest_level: 0 },
        { ...record(1, 'First group', 'second'), interest_level: '2', refersTo: 'zebras' },
        { ...record(1, 'First group', 'first'), interest_level: 2, refersTo: 'apes' },
        { ...record(1, 'First group', 'hidden'), interest_level: 3, hide_term: '1' }
    ];
    const collection = normalizeCollectiveResponse(rows);
    render(<CollectiveLanding appHeader categorySlug="category-1" collection={collection} />);
    expect([...document.querySelectorAll('.collective-list .word-item-word')].map(item => item.textContent))
        .toEqual(['first', 'second', 'zero', 'unrated']);
});

test('category controls sort by subject, collective term, or interest level', () => {
    const collection = normalizeCollectiveResponse([
        { ...record(1, 'First group', 'a zephyr of apes'), term: 'zephyr', refersTo: 'apes', interest_level: 1 },
        { ...record(1, 'First group', 'an accord of zebras'), term: 'accord', refersTo: 'zebras', interest_level: 2 },
        { ...record(1, 'First group', 'a gathering of bees'), term: 'gathering', refersTo: 'bees', interest_level: 3 }
    ]);
    render(<CollectiveLanding appHeader categorySlug="category-1" collection={collection} />);
    const expressions = () => [...document.querySelectorAll('.collective-list .word-item-word')].map(item => item.textContent);
    expect(expressions()).toEqual(['a gathering of bees', 'an accord of zebras', 'a zephyr of apes']);
    fireEvent.click(screen.getByRole('button', { name: 'Subject A–Z' }));
    expect(expressions()).toEqual(['a zephyr of apes', 'a gathering of bees', 'an accord of zebras']);
    fireEvent.click(screen.getByRole('button', { name: 'Term A–Z' }));
    expect(expressions()).toEqual(['an accord of zebras', 'a gathering of bees', 'a zephyr of apes']);
    fireEvent.click(screen.getByRole('button', { name: 'Interest level' }));
    expect(screen.getByRole('button', { name: 'Interest level' })).toHaveAttribute('aria-pressed', 'true');
    expect(expressions()[0]).toBe('a gathering of bees');
});

test('supplied notes appear after the expression and before its source, without duplicates', () => {
    const row = record(1, 'First group', 'an expression with context');
    const collection = normalizeCollectiveResponse([
        { ...row, note: 'A little context.' },
        { ...row, source: 'Other source', note: 'A little context.' },
        { ...record(1, 'First group', 'an expression without a note'), note: '   ' }
    ]);
    render(<CollectiveLanding appHeader categorySlug="category-1" collection={collection} />);
    const note = screen.getByText('A little context.');
    expect(note.previousElementSibling).toHaveTextContent('an expression with context');
    expect(note.nextElementSibling).toHaveTextContent('Source: Test; Other source');
    expect(document.querySelectorAll('.collective-expression-note')).toHaveLength(1);
});

test('category images use UI-root paths for new paths and legacy API-hosted URLs', () => {
    expect(collectiveImageUrl('public/collective/Birds and Beasts.png')).toBe('/collective/Birds%20and%20Beasts.png');
    expect(collectiveImageUrl('/public/collective/Birds.png')).toBe('/collective/Birds.png');
    expect(collectiveImageUrl('/collective/Birds%20and%20Beasts.png')).toBe('/collective/Birds%20and%20Beasts.png');
    expect(collectiveImageUrl('https://wordmage.toews-api.com/public/collective/Birds.png')).toBe('/collective/Birds.png');
    expect(collectiveImageUrl(null)).toBeNull();
    expect(collectiveImageUrl('javascript:alert(1)')).toBeNull();
});

test('term illustrations use UI assets, omit blanks, and survive merging duplicate entries', () => {
    const row = record(1, 'First group', 'a clattering of choughs');
    const collection = normalizeCollectiveResponse([
        { ...row, image_path: '  ' },
        { ...row, source: 'Other source', image_path: 'public/collective-illustrations/Red-Billed Chough on Coastal Ruins.png' },
        { ...record(1, 'First group', 'another expression'), image_path: null }
    ]);
    render(<CollectiveLanding appHeader categorySlug="category-1" collection={collection} />);
    const images = document.querySelectorAll('.collective-expression-image');
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute('src', '/collective-illustrations/Red-Billed%20Chough%20on%20Coastal%20Ruins.png');
    expect(images[0].previousElementSibling).toHaveTextContent('a clattering of choughs');
});
