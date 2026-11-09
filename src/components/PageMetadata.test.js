import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { act } from 'react-dom/test-utils';
import PageMetadata from './PageMetadata';

afterEach(() => {
    document.head.querySelectorAll('meta[name="robots"], meta[name="description"], meta[name="wordmage-deployment"], link[rel="canonical"]').forEach(element => element.remove());
});

test('client routing preserves the root canonical alias and excludes private pages', () => {
    const history = createMemoryHistory({ initialEntries: ['/random?campaign=test'] });
    render(<Router history={history}><PageMetadata /></Router>);
    expect(document.querySelector('link[rel="canonical"]').href).toBe('https://wordmage.app/');
    act(() => history.push('/rare-words'));
    expect(document.title).toBe('Rare English Words and Their Meanings | WordMage');
    act(() => history.push('/albums'));
    expect(document.querySelector('meta[name="robots"]').content).toBe('noindex, follow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
});

test('a preview remains noindex after navigating to public pages', () => {
    const marker = document.createElement('meta');
    marker.name = 'wordmage-deployment'; marker.content = 'preview'; document.head.appendChild(marker);
    const history = createMemoryHistory({ initialEntries: ['/rare-words'] });
    render(<Router history={history}><PageMetadata /></Router>);
    act(() => history.push('/gothic-vocabulary'));
    expect(document.querySelector('meta[name="robots"]').content).toBe('noindex, follow');
});
