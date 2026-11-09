import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Random from './Random';
import { getRandomPageData } from '../utils/api';

jest.mock('../utils/api', () => ({ getRandomPageData: jest.fn() }));
jest.mock('./WordScroller', () => ({ pool }) => <div>{pool.map(word => <p key={word.id}>{word.word}</p>)}</div>);
jest.mock('./Popup', () => () => null);

test('Random still loads, refreshes and undoes without the discovery button row', async () => {
    localStorage.clear(); sessionStorage.clear();
    getRandomPageData.mockResolvedValueOnce({ words: [{ id: 1, word: 'first selection' }], featured_favorite: { word: 'personal favorite', def: 'A saved favorite.' } })
        .mockResolvedValueOnce({ words: [{ id: 2, word: 'second selection' }] });
    render(<MemoryRouter><Random /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Random');
    expect(await screen.findByText('first selection')).toBeInTheDocument();
    expect(screen.getByText('personal favorite')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Discover more words' })).not.toBeInTheDocument();
    expect(screen.queryByText('How this generator works')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh random words' }));
    expect(await screen.findByText('second selection')).toBeInTheDocument();
    expect(screen.queryByText('personal favorite')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo last refresh' }));
    await waitFor(() => expect(screen.getByText('first selection')).toBeInTheDocument());
    expect(screen.getByText('personal favorite')).toBeInTheDocument();
    expect(getRandomPageData).toHaveBeenCalledTimes(2);
});

