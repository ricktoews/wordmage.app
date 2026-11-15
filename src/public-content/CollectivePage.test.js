import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CollectivePage from './CollectivePage';
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
