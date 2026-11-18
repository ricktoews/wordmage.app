import { render, screen, fireEvent } from '@testing-library/react';
import { collectives } from './collective-data.mjs';
import { CollectiveLanding } from './CollectiveLanding.mjs';

beforeEach(() => localStorage.clear());

test('collective favorites toggle, persist on remount, and stay separate from word favorites', () => {
    const first = render(<CollectiveLanding appHeader categorySlug="birds" />);
    const button = screen.getAllByRole('button', { name: /^Favorite / })[0];
    const expression = button.getAttribute('aria-label').replace(/^Favorite /, '');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button.querySelector('path')).toHaveAttribute('fill', 'none');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button.querySelector('path')).toHaveAttribute('fill', 'currentColor');
    expect(JSON.parse(localStorage.getItem('wordmage.collective-favorites.v1'))).toHaveLength(1);
    first.unmount();
    render(<CollectiveLanding appHeader categorySlug="birds" />);
    const restored = screen.getByRole('button', { name: `Unfavorite ${expression}` });
    expect(restored).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(restored);
    expect(restored).toHaveAttribute('aria-pressed', 'false');
    expect(JSON.parse(localStorage.getItem('wordmage.collective-favorites.v1'))).toEqual([]);
});

test('collective favorites synchronize changes from another tab', () => {
    render(<CollectiveLanding appHeader categorySlug="birds" />);
    const button = screen.getAllByRole('button', { name: /^Favorite / })[0];
    fireEvent.click(button);
    localStorage.removeItem('wordmage.collective-favorites.v1');
    fireEvent(window, new StorageEvent('storage', { key: 'wordmage.collective-favorites.v1' }));
    expect(button).toHaveAttribute('aria-pressed', 'false');
});

test('category pages omit filters but keep individual favorite toggles', () => {
    render(<CollectiveLanding appHeader categorySlug="birds" />);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Favorites' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(collectives.filter(item => item.categoryId === 1).length);
    expect(screen.getAllByRole('button', { name: /^Favorite / })).toHaveLength(collectives.filter(item => item.categoryId === 1).length);
});

test('overview displays only the category links in supplied order', () => {
    render(<CollectiveLanding appHeader />);
    const links = [...document.querySelectorAll('.collective-category-index a')];
    expect(links).toHaveLength(10);
    expect(links[0]).toHaveAttribute('aria-label', 'Birds of a Feather');
    expect(links[9]).toHaveAttribute('aria-label', 'Curiosities and Absurdities');
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(document.querySelector('.collective-list')).toBeNull();
});

test('category headings link to dedicated pages with only their own expressions', () => {
    const overview = render(<CollectiveLanding appHeader />);
    expect(screen.getByRole('link', { name: 'Birds of a Feather' })).toHaveAttribute('href', '/collective-nouns/birds');
    overview.unmount();
    const category = render(<CollectiveLanding appHeader categorySlug="birds" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Birds of a Feather');
    expect(document.querySelectorAll('.collective-category')).toHaveLength(1);
    expect(document.querySelectorAll('.collective-list > li')).toHaveLength(collectives.filter(item => item.categoryId === 1).length);
    expect(screen.getByRole('link', { name: /All collective nouns/ })).toHaveAttribute('href', '/collective-nouns');
    category.unmount();
    render(<CollectiveLanding appHeader categorySlug="nonexistent" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('This page has wandered off');
});
