import { render, screen, fireEvent } from '@testing-library/react';
import { CollectiveLanding } from './CollectiveLanding.mjs';

beforeEach(() => localStorage.clear());

test('collective favorites toggle, persist on remount, and stay separate from word favorites', () => {
    const first = render(<CollectiveLanding appHeader />);
    const button = screen.getAllByRole('button', { name: /^Favorite / })[0];
    const expression = button.getAttribute('aria-label').replace(/^Favorite /, '');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button.querySelector('path')).toHaveAttribute('fill', 'none');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button.querySelector('path')).toHaveAttribute('fill', 'currentColor');
    expect(JSON.parse(localStorage.getItem('wordmage.collective-favorites.v1'))).toHaveLength(1);
    first.unmount();
    render(<CollectiveLanding appHeader />);
    const restored = screen.getByRole('button', { name: `Unfavorite ${expression}` });
    expect(restored).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(restored);
    expect(restored).toHaveAttribute('aria-pressed', 'false');
    expect(JSON.parse(localStorage.getItem('wordmage.collective-favorites.v1'))).toEqual([]);
});

test('collective favorites synchronize changes from another tab', () => {
    render(<CollectiveLanding appHeader />);
    const button = screen.getAllByRole('button', { name: /^Favorite / })[0];
    fireEvent.click(button);
    localStorage.removeItem('wordmage.collective-favorites.v1');
    fireEvent(window, new StorageEvent('storage', { key: 'wordmage.collective-favorites.v1' }));
    expect(button).toHaveAttribute('aria-pressed', 'false');
});

test('Favorites and All filter the list using browser favorites', () => {
    render(<CollectiveLanding appHeader />);
    const button = screen.getAllByRole('button', { name: /^Favorite / })[0];
    fireEvent.click(button);
    fireEvent.click(screen.getByRole('button', { name: 'Favorites' }));
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(447);
});
