import { navigatePublicLink } from './public-navigation';

test('public hrefs navigate within React without another document startup', () => {
    const anchor = document.createElement('a');
    anchor.href = '/gothic-vocabulary';
    anchor.dataset.publicLink = 'true';
    const event = { target: anchor, button: 0, preventDefault: jest.fn() };
    const history = { push: jest.fn() };
    const originalScroll = window.scrollTo;
    window.scrollTo = jest.fn();
    try {
        navigatePublicLink(event, history);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(history.push).toHaveBeenCalledWith('/gothic-vocabulary');
        navigatePublicLink({ ...event, ctrlKey: true }, history);
        expect(history.push).toHaveBeenCalledTimes(1);
    } finally { window.scrollTo = originalScroll; }
});
