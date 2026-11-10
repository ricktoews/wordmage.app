import { createRequire } from 'node:module';
const snapshot = createRequire(import.meta.url)('../src/public-content/landing-snapshot.json');
import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://localhost:8888';
for (const [route, sample, canonical] of [
    ['/', 'petrichor', '/'], ['/random', 'petrichor', '/'],
    ['/rare-words', snapshot.rare[0].word, '/rare-words'],
    ['/gothic-vocabulary', snapshot.gothic[0].word, '/gothic-vocabulary'],
    ['/collective-nouns', 'A charm of goldfinches', '/collective-nouns'],
    ['/browse', 'abderian', '/browse'], ['/about', 'entertainment for word fanciers', '/about']
]) {
    const response = await fetch(`${base}${route}`, { redirect: 'manual' });
    const html = await response.text();
    assert.equal(response.status, 200, route);
    assert.ok(html.includes(sample), `${route} substantive HTML`);
    assert.ok(html.includes(`rel="canonical" href="https://wordmage.app${canonical}"`), `${route} canonical`);
    assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), `${route} must be indexable`);
    assert.ok(!html.includes('content="noindex'), `${route} robots meta`);
    console.log(`200 indexable HTML: ${route}`);
}
for (const route of ['/does-not-exist', '/rare-word-generator', '/rare-word-generator/', '/rare-word-generator/index.html', '/collective-nouns/not-a-page', '/rare-words/not-a-page', '/gothic-vocabulary/not-a-page', '/albums/1/not-a-page']) {
    const response = await fetch(`${base}${route}`, { redirect: 'manual' });
    assert.equal(response.status, 404, route);
    assert.ok((await response.text()).includes('noindex'), route);
    console.log(`404 noindex: ${route}`);
}
for (const route of ['/mock', '/albums', '/albums/123', '/login', '/inbox', '/browse/c', '/shared/albums/example']) {
    const response = await fetch(`${base}${route}`, { redirect: 'manual' });
    assert.equal(response.status, 200, route);
    assert.ok((await response.text()).includes('content="noindex'), route);
    console.log(`200 noindex workspace: ${route}`);
}
for (const route of ['/collective', '/collective/', '/collective/index.html', '/collective/goldfinches']) {
    const response = await fetch(`${base}${route}`, { redirect: 'manual' });
    assert.equal(response.status, 301, route);
    const destination = new URL(response.headers.get('location'), base);
    assert.equal(destination.pathname, '/collective-nouns');
    if (route.endsWith('/goldfinches')) assert.equal(destination.searchParams.get('search'), 'goldfinches');
}
console.log('301 legacy collective routes');
const aliasFile = await fetch(`${base}/random/index.html`, { redirect: 'manual' });
assert.equal(aliasFile.status, 301);
console.log('301 Random HTML file alias');
const sitemapResponse = await fetch(`${base}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200);
const locations = [...(await sitemapResponse.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]));
assert.equal(locations.length, 6);
for (const location of locations) {
    assert.equal(location.origin, 'https://wordmage.app');
    const response = await fetch(`${base}${location.pathname}`, { redirect: 'manual' });
    assert.equal(response.status, 200, `sitemap ${location.pathname}`);
    assert.ok((await response.text()).includes(`rel="canonical" href="${location.href}"`));
}
console.log('All six sitemap URLs resolve with matching production canonicals.');
