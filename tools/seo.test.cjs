const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');


function build(context) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wordmage-seo-'));
    fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><html><head><title>WordMage</title><meta name="description" content="old"/><script defer src="/app.js"></script></head><body><div id="root"></div></body></html>');
    execFileSync(process.execPath, [path.join(__dirname, 'build-public-pages.js'), dir], { env: { ...process.env, CONTEXT: context } });
    // Re-running the generator must not duplicate content or indexing metadata.
    execFileSync(process.execPath, [path.join(__dirname, 'build-public-pages.js'), dir], { env: { ...process.env, CONTEXT: context } });
    return dir;
}

test('production HTML contains substantive content and one correct canonical per public page', async () => {
    const { pages } = await import('../src/public-content/pages.mjs');
    const dir = build('production');
    try {
        const sitemap = fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf8');
        for (const [route, page] of Object.entries(pages)) {
            if (page.deferred) {
                assert.ok(!sitemap.includes(route));
                assert.ok(!fs.existsSync(path.join(dir, route.slice(1))));
                continue;
            }
            const file = route === '/' ? 'index.html' : route === '/404' ? '404.html' : `${route.slice(1)}/index.html`;
            const html = fs.readFileSync(path.join(dir, file), 'utf8');
            assert.ok(html.replace(/<[^>]*>/g, '').includes(page.heading));
            assert.ok(/<h1\b/.test(html));
            assert.equal((html.match(/<h1\b/g) || []).length, 1);
            assert.equal((html.match(/name="robots"/g) || []).length, 1);
            assert.ok(html.includes('src="/app.js"'));
            assert.equal((html.match(/name="description"/g) || []).length, 1);
            if (page.noindex) {
                assert.ok(html.includes('noindex, follow'));
                assert.ok(!sitemap.includes('/404'));
            } else {
                assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
                assert.ok(html.includes(`href="https://wordmage.app${route}"`));
                assert.ok(sitemap.includes(`<loc>https://wordmage.app${route}</loc>`));
            }
        }
        assert.ok(fs.readFileSync(path.join(dir, 'index.html'), 'utf8').includes('petrichor'));
        assert.ok(!fs.existsSync(path.join(dir, 'rare-word-generator')));
        assert.ok(!sitemap.includes('rare-word-generator'));
        const snapshot = require('../src/public-content/landing-snapshot.json');
        for (const [theme, route] of [['rare', 'rare-words'], ['gothic', 'gothic-vocabulary']]) {
            const html = fs.readFileSync(path.join(dir, `${route}/index.html`), 'utf8');
            assert.ok(html.includes(snapshot[theme][0].word));
            assert.ok(html.includes(snapshot[theme][1].def.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')));
        }
        assert.ok(sitemap.includes('https://wordmage.app/collective-nouns'));
        const collectiveHtml = fs.readFileSync(path.join(dir, 'collective-nouns/index.html'), 'utf8');
        assert.ok(collectiveHtml.includes('A charm of goldfinches'));
        assert.equal((collectiveHtml.match(/<li><button type="button" class="word-favorite-toggle"/g) || []).length, 447);
        assert.ok(collectiveHtml.includes('individual usage histories have not been assessed'));
        assert.ok(!collectiveHtml.includes('name="robots" content="noindex'));
        assert.equal(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), fs.readFileSync(path.join(dir, 'random/index.html'), 'utf8'));
        assert.ok(!/albums|login|inbox|random/.test(sitemap));
        assert.ok(fs.readFileSync(path.join(dir, 'albums/index.html'), 'utf8').includes('noindex'));
        const redirects = fs.readFileSync(path.join(dir, '_redirects'), 'utf8');
        assert.ok(!redirects.includes('rare-word-generator'));
        assert.ok(redirects.includes('/albums/:id /app-shell.html 200'));
        assert.ok(redirects.endsWith('/* /404.html 404\n'));
        assert.ok(!redirects.includes('/* /index.html 200'));
        assert.ok(!fs.readFileSync(path.join(dir, '_headers'), 'utf8').includes('/browse/'));
    } finally { fs.rmSync(dir, { recursive: true }); }
});

test('preview and branch builds are noindex in HTML and headers with an empty sitemap', () => {
    for (const context of ['deploy-preview', 'branch-deploy']) {
        const dir = build(context);
        try {
            const html = fs.readFileSync(path.join(dir, 'rare-words/index.html'), 'utf8');
            assert.ok(html.includes('content="noindex, follow"'));
            assert.ok(html.includes('name="wordmage-deployment" content="preview"'));
            assert.ok(fs.readFileSync(path.join(dir, '_headers'), 'utf8').includes('/*\n  X-Robots-Tag: noindex, nofollow'));
            assert.ok(!fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf8').includes('<loc>'));
        } finally { fs.rmSync(dir, { recursive: true }); }
    }
});
