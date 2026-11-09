// Smoke-test the actual production bundle in a DOM with a mocked workspace API.
// This is not a visual browser test. jsdom is already installed with CRA/Jest.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const snapshot = require('../src/public-content/landing-snapshot.json');

async function checkRoute(route, authenticated, bundle) {
    const calls = [];
    const errors = [];
    const filename = route === '/' ? 'index.html' : `${route.slice(1)}/index.html`;
    const dom = new JSDOM(fs.readFileSync(path.join('build', filename), 'utf8'), {
        url: `https://wordmage.app${route}?campaign=test#example`,
        runScripts: 'outside-only', pretendToBeVisual: true,
        virtualConsole: new VirtualConsole(),
        beforeParse(window) {
            if (authenticated) {
                window.localStorage.setItem('wordmage-profile-user_id', '99');
                window.localStorage.setItem('wordmage-auth-token', 'signed-in-test');
            }
            window.scrollTo = () => {};
            window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
            window.fetch = async (url, options = {}) => {
                const request = new URL(url);
                calls.push({ request, options });
                const payload = request.pathname === '/anonymous-user' ? { user_id: 99, anonymous_token: 'test-only' }
                    : request.pathname === '/loadcustom' ? { album_ids: {} }
                    : request.pathname === '/get-random-page-data' ? { words: [{ id: 1, word: 'runtime-sample', def: 'A simulated vocabulary entry.' }] }
                    : request.pathname === '/get-landing-page-words' ? { success: true, page: JSON.parse(options.body).page, words: snapshot[JSON.parse(options.body).page] }
                    : request.pathname === '/get-words-page' ? { words: [], has_more: false, next_cursor: null }
                    : {};
                return { ok: true, json: async () => payload };
            };
            window.addEventListener('error', event => errors.push(event.error));
        }
    });
    const waitFor = async predicate => {
        for (let i = 0; i < 100; i += 1) {
            if (predicate()) return;
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        throw new Error(`Runtime condition timed out. ${errors.join('; ')}`);
    };
    try {
        dom.window.eval(bundle);
        await waitFor(() => dom.window.document.querySelector('.App'));
        const click = href => dom.window.document.querySelector(`a[data-public-link][href="${href}"]`)
            .dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, button: 0 }));
        click('/gothic-vocabulary');
        await waitFor(() => dom.window.location.pathname === '/gothic-vocabulary' && dom.window.document.title.startsWith('Gothic Words'));
        await waitFor(() => dom.window.sessionStorage.getItem('wordmage.landing-selection.v1.gothic'));
        await waitFor(() => dom.window.document.querySelector('.editorial-feature-word')?.textContent === JSON.parse(dom.window.sessionStorage.getItem('wordmage.landing-selection.v1.gothic'))[0].word);
        assert.equal(dom.window.document.querySelectorAll('header.site-masthead').length, 1);
        assert.equal(dom.window.document.querySelectorAll('.editorial-masthead').length, 0);
        assert.equal(dom.window.document.querySelector('.site-bottom-nav'), null);
        assert.ok(dom.window.document.querySelector('.hamburger-nav').textContent.includes('New Words'));
        assert.ok(dom.window.document.querySelector('.hamburger-nav').textContent.includes('Settings'));
        const feature = dom.window.document.querySelector('.editorial-feature-word').textContent;
        click('/rare-words');
        await waitFor(() => dom.window.sessionStorage.getItem('wordmage.landing-selection.v1.rare'));
        click('/gothic-vocabulary');
        await waitFor(() => dom.window.location.pathname === '/gothic-vocabulary');
        assert.equal(dom.window.document.querySelector('.editorial-feature-word').textContent, feature);
        for (const theme of ['rare', 'gothic']) {
            const requests = calls.filter(({ request, options }) => request.pathname === '/get-landing-page-words' && JSON.parse(options.body).page === theme);
            assert.equal(requests.length, 1, `${theme} selection reused across navigation`);
            assert.equal(requests[0].options.method, 'POST');
            assert.equal(requests[0].options.headers.Authorization, `Bearer ${authenticated ? 'signed-in-test' : 'test-only'}`);
            assert.equal(requests[0].request.search, '');
        }
        click('/');
        await waitFor(() => dom.window.document.body.textContent.includes('runtime-sample'));
        assert.equal(dom.window.document.querySelector('nav.hamburger-nav a[href="/rare-words"] span:last-child').textContent, 'Rare Words');
        assert.deepEqual(Array.from(dom.window.document.querySelectorAll('.site-bottom-nav a,.site-bottom-nav button'), node => node.textContent), ['Random', 'Browse', 'Favorites', 'Albums', 'Share']);
        assert.equal(dom.window.document.querySelector('.header-nav-buttons'), null);
        const share = dom.window.document.querySelector('.site-bottom-nav button');
        assert.equal(share.getAttribute('aria-label'), 'Share random words');
        share.click();
        await waitFor(() => dom.window.document.querySelector('.popup-container'));
        const startups = calls.filter(({ request }) => request.pathname === '/loadcustom');
        assert.equal(startups.length, 1);
        assert.equal(startups[0].request.searchParams.get('entry'), route);
        assert.equal(startups[0].options.method, 'POST');
        assert.equal(startups[0].options.headers.Authorization, `Bearer ${authenticated ? 'signed-in-test' : 'test-only'}`);
        assert.equal(dom.window.document.querySelector('link[rel="canonical"]').href, 'https://wordmage.app/');
        assert.equal(errors.length, 0);
        console.log(`Direct ${route}: ${authenticated ? 'authenticated' : 'anonymous'} entry preserved; React navigation adds no landing.`);
    } finally { dom.window.close(); }
}

async function main() {
    const manifest = JSON.parse(fs.readFileSync('build/asset-manifest.json', 'utf8'));
    const bundle = fs.readFileSync(path.join('build', manifest.files['main.js'].replace(/^\//, '')), 'utf8');
    for (const route of ['/', '/random', '/rare-words', '/gothic-vocabulary', '/browse', '/about']) {
        for (const authenticated of [false, true]) await checkRoute(route, authenticated, bundle);
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
