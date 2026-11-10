/* Generate substantive HTML using the same content components as the React app.
 * Runs after CRA: no browser automation, live API, credentials, or new packages.
 */
const fs = require('fs');
const path = require('path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
async function main() {
    const { origin, pages, appRoutes } = await import('../src/public-content/pages.mjs');
    const { PublicContent } = await import('../src/public-content/PublicContent.mjs');
    const { CollectiveLanding } = await import('../src/public-content/CollectiveLanding.mjs');
    const snapshot = require('../src/public-content/landing-snapshot.json');
    const output = path.resolve(process.argv[2] || 'build');
    const template = fs.readFileSync(path.join(output, 'index.html'), 'utf8')
        .replace(/<meta name="(?:robots|wordmage-deployment)" content="[^"]*"\s*\/?\s*>/g, '')
        .replace(/<link rel="canonical" href="[^"]*"\s*\/?\s*>/g, '');
    const preview = Boolean(process.env.CONTEXT && process.env.CONTEXT !== 'production');
    const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    function documentFor(page, content, canonical) {
        const noindex = preview || page.noindex;
        return template.replace(/<title>.*?<\/title>/, `<title>${escape(page.title)}</title>`)
            .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/, `<meta name="description" content="${escape(page.description)}"/>`)
            .replace('</head>', `<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}"/><meta name="wordmage-deployment" content="${preview ? 'preview' : 'production'}"/>${canonical ? `<link rel="canonical" href="${origin}${canonical}"/>` : ''}</head>`)
            .replace(/<div id="root">[\s\S]*<\/div>/, `<div id="root">${content}</div>`)
            .replace('You need to enable JavaScript to run this app.', 'The vocabulary below is available without JavaScript. Enable JavaScript for random refresh, search, and personal collections.');
    }
    function write(relative, text) {
        const filename = path.join(output, relative);
        fs.mkdirSync(path.dirname(filename), { recursive: true });
        fs.writeFileSync(filename, text);
    }
    Object.entries(pages).forEach(([route, page]) => {
        if (page.deferred) return;
        const theme = route === '/rare-words' ? 'rare' : route === '/gothic-vocabulary' ? 'gothic' : null;
        const landingWords = theme ? snapshot[theme].slice(0, theme === 'rare' ? 9 : 13) : undefined;
        const content = renderToStaticMarkup(React.createElement(route === '/collective-nouns' ? CollectiveLanding : PublicContent, { page: route, landingWords, embedded: ['/', '/browse'].includes(route) }));
        const html = documentFor(page, content, page.noindex ? null : route);
        write(route === '/' ? 'index.html' : route === '/404' ? '404.html' : `${route.slice(1)}/index.html`, html);
        if (route === '/') write('random/index.html', html);
    });
    const privatePage = { title: 'Your WordMage Workspace', description: 'Your personal WordMage collections and tools.', noindex: true };
    const privateHtml = documentFor(privatePage, '<p>Loading your WordMage workspace…</p>', null);
    write('app-shell.html', privateHtml);
    // Exact workspace routes receive useful metadata even before JavaScript loads.
    appRoutes.filter(route => !route.includes(':')).forEach(route => {
        const name = route.slice(1).replace(/-/g, ' ');
        write(`${route.slice(1)}/index.html`, documentFor({ ...privatePage, title: `${name.charAt(0).toUpperCase()}${name.slice(1)} | WordMage` }, '<p>Loading your WordMage workspace…</p>', null));
    });
    const indexable = Object.keys(pages).filter(route => !pages[route].noindex && !pages[route].deferred);
    write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${preview ? '' : indexable.map(route => `  <url><loc>${origin}${route}</loc></url>`).join('\n')}\n</urlset>\n`);
    write('robots.txt', `User-agent: *\nAllow: /\n${preview ? '' : `Sitemap: ${origin}/sitemap.xml\n`}`);
    const rules = [
        '/collective/index.html /collective-nouns 301!',
        '/collective /collective-nouns 301!',
        '/collective/ /collective-nouns 301!',
        '/collective/:start /collective-nouns?search=:start 301!',
        '/index.html / 301!',
        '/random/index.html /random 301!',
        ...indexable.filter(route => route !== '/').map(route => `${route}/index.html ${route} 301!`),
        ...appRoutes.map(route => `${route} /app-shell.html 200`),
        '/* /404.html 404'
    ];
    write('_redirects', `${rules.join('\n')}\n`);
    // Browse subroutes inherit the noindex app shell. A header under /browse would
    // also match the generated /browse/index.html and exclude the public introduction.
    const noindexPaths = [...appRoutes.filter(route => route !== '/browse/:start'), '/app-shell.html', '/404.html'];
    write('_headers', preview ? '/*\n  X-Robots-Tag: noindex, nofollow\n' : noindexPaths.map(route => `${route}\n  X-Robots-Tag: noindex, follow\n`).join('\n'));
    console.log(`Generated ${indexable.length} public pages, /random alias, private shells, sitemap, and Netlify routing (${preview ? 'noindex preview' : 'production'}).`);

}
main().catch(error => { console.error(error); process.exitCode = 1; });
