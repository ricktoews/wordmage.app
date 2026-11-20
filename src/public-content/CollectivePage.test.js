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

test('category pages omit sorting controls', () => {
    render(<CollectiveLanding appHeader categorySlug="birds" />);
    expect(screen.queryByRole('group', { name: 'Sort expressions' })).not.toBeInTheDocument();
});

test('only the primary expression note is displayed once per subject group', () => {
    const row = record(1, 'First group', 'an expression with context');
    const collection = normalizeCollectiveResponse([
        { ...row, note: 'A little context.' },
        { ...row, source: 'Other source', note: 'A little context.' },
        { ...record(1, 'First group', 'an expression without a note'), note: '   ' }
    ]);
    render(<CollectiveLanding appHeader categorySlug="category-1" collection={collection} />);
    expect(screen.getByText('A little context.')).toBeInTheDocument();
    expect(document.querySelectorAll('.collective-expression-note')).toHaveLength(1);
    expect(collection.collectives.find(item => item.expression === row.expression).notes).toEqual(['A little context.']);
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
    expect(images[0].previousElementSibling).toHaveTextContent('Also another expression(Test)');
    expect(images[0].parentElement).toHaveTextContent('(Test; Other source)');
});

test('expressions for one subject stay together, each with its own source and Also for alternatives', () => {
    const collection = normalizeCollectiveResponse([
        { ...record(1, 'First group', 'a deceit of lapwings'), term: 'deceit', refersTo: 'lapwings', source: 'First source', interest_level: 3, image_path: '/collective-illustrations/test.png', note: 'Primary note.' },
        { ...record(1, 'First group', 'a desert of lapwings'), term: 'desert', refersTo: ' Lapwings ', source: 'Second source', interest_level: 1, note: 'Alternative note stays hidden.' },
        { ...record(1, 'First group', 'a charm of finches'), term: 'charm', refersTo: 'finches', interest_level: 2 },
        { ...record(2, 'Second group', 'a flight of lapwings'), refersTo: 'lapwings' }
    ]);
    render(<CollectiveLanding appHeader categorySlug="category-1" collection={collection} />);
    const groups = document.querySelectorAll('.collective-subject-group');
    expect(groups).toHaveLength(2);
    expect(groups[0].querySelectorAll('.collective-expression')).toHaveLength(2);
    expect(groups[0]).toHaveTextContent('a deceit of lapwings(First source)Also a desert of lapwings(Second source)');
    expect(groups[0].querySelectorAll('.collective-also')).toHaveLength(1);
    expect(groups[0].lastElementChild).toHaveClass('collective-expression-note');
    expect(groups[0].lastElementChild).toHaveTextContent('Primary note.');
    expect(groups[0].lastElementChild.previousElementSibling).toHaveClass('collective-expression-image');
    expect(groups[0].querySelectorAll('.collective-expression-note')).toHaveLength(1);
    expect(screen.queryByText('Alternative note stays hidden.')).not.toBeInTheDocument();
    expect(groups[1].querySelector('.collective-also')).toBeNull();
    expect(screen.queryByText('a flight of lapwings')).not.toBeInTheDocument();
});
