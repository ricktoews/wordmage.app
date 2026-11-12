# WordMage public SEO foundation

## Implementation and tradeoffs

The original Create React App build returned an empty application root and generic
metadata, and its Netlify wildcard returned HTTP 200 for nonexistent URLs. It also
exposed no crawlable links from its initial HTML. The surviving CollectiveWords
component relied on a disabled `initializeWordPool()` startup call.

The chosen solution is build-time static rendering of a small set of public
content components. `npm run build` builds the existing React app, then runs
`tools/build-public-pages.js`. That script uses the existing React server renderer
to write real content, titles, descriptions, and canonicals into each HTML file.
Shared native ES modules provide the same content to the browser and Node without
new dependencies. No live API or credentials are needed at build time.

Alternatives considered:

- Client-only metadata: insufficient because substantive initial HTML is missing.
- Browser prerendering of the full app: adds browser tooling and couples builds to
  API availability, asynchronous startup, and personal-workspace state.
- SSR or framework migration: unnecessary complexity for these reference pages.

This is static generation, not a full server-rendered application. React mounts
the existing interactive application over the initial content. The public content
is retained in its React version, rather than being replaced by unrelated copy.
An unavailable workspace API no longer prevents the public app from mounting.

The generator does not snapshot personal albums, user information, tokens, or
workspace responses. Anonymous workspaces and existing login behavior remain;
no new registration step, analytics service, paid service, or generator is added.

## Public routes and indexing

| Route | Initial HTML and policy |
| --- | --- |
| `/` | Existing Random experience with initial-HTML sample vocabulary; canonical `/` |
| `/random` | Same content and canonical `/`; existing navigation still works |
| `/rare-words` | Curated rare-word definitions and editorial context |
| `/gothic-vocabulary` | Vocabulary grouped by darkness, atmosphere, architecture, mystery, and emotion |
| `/collective-nouns` | Public collection with all distinct expressions, source labels, search, sorting, and optional highlights |
| `/browse` | Introduction and sample vocabulary alongside existing API-powered Browse |
| `/about` | Updated description and ordinary links to public resources |

The sitemap contains only the six active canonical public URLs. It excludes `/random`,
query variants, Browse cursors, new-word feeds, private collections, shared album
tokens, login, registration, settings, assistant linking, training, and admin pages.
Their HTML shells carry `noindex`. Generated response-header rules reinforce this
where supported. `robots.txt` permits crawling so crawlers can see `noindex`, and
advertises the production sitemap. Indexing exclusion is not access control.

The build replaces the blanket SPA rewrite with explicit application routes and
a final `/404.html` rewrite with status 404. Unknown public paths and extra segments
therefore return a real 404 instead of a soft 404. Existing syntactically valid
private dynamic routes retain their application shell and existing API behavior;
this layer does not validate album IDs. The client also renders a not-found page.

Old `/collective` URLs permanently redirect to `/collective-nouns`; starting
terms become a search query. Public HTML entry
files redirect to their canonical route. Trailing-slash variants use the same
canonical. Query strings and fragments never enter canonical URLs.

Netlify deploy previews and branch builds (`CONTEXT` other than `production`)
receive noindex HTML, a global `X-Robots-Tag: noindex, nofollow`, and an empty sitemap.
Client-side metadata preserves the preview marker after navigation. Production
canonicals always use `https://wordmage.app`, including builds reached through
Netlify aliases. Build with `npm run build`, not `react-scripts build` alone.

Public links have real `href` attributes. Once React mounts, normal same-tab clicks
use the router without restarting the application. Modifier-clicks and links
without JavaScript retain normal browser behavior. This preserves the startup-only
`loadcustom?entry=` tracking introduced earlier; route changes are not new landings.

## Random

Random is the sole random-word tool, preserving refresh, undo, and the featured
favorite returned for eligible users. Public navigation and the Rare Words
“Surprise me” link lead to `/`. There is no separate Word Generator page or route.
Initial HTML at `/` and `/random` retains sample vocabulary and public links.

## Vocabulary selection and maintenance

### Editorial landing-page presentation

Rare Words and Gothic Vocabulary use a distinct public-facing layout: a minimal
WordMage masthead, an ink-colored hero, an existing featured word, native SVG
letterform/arch ornaments, and a paper-colored collection below. Rare Words uses
gold/plum accents; Gothic Vocabulary uses lavender/midnight accents and category
links. The primary action is an ordinary same-page link to the collection; other
public links keep their real hrefs and existing React navigation behavior.

These two routes have a dedicated public navigation drawer with an active-page
indicator, outside-click close, and Escape close. Before JavaScript mounts, the
initial HTML uses a native details-based menu instead. The internal Random, Browse,
and album experiences retain their existing layouts. Collective Nouns has since been restored as a separate landing page.

The same components generate the initial HTML and the React pages. Rare and Gothic
vocabulary now comes from `POST /get-landing-page-words` using the existing
anonymous or signed-in authentication. Each tab keeps a separate selection per
page in sessionStorage, including its featured entry. A refresh button requests a
new selection deliberately. Gothic uses one collection rather than inferring
categories or example sentences from boolean flags.

`src/public-content/landing-snapshot.json` stores actual themed API records for
initial HTML and fallback. Normal builds make no API calls. Refresh this snapshot
explicitly after flag changes; see `docs/landing-selection-api.md` for the command,
response contract, storage behavior, and offline handling. No bitmap assets, new
dependencies, or tracking subsystem were added.

`src/public-content/words.mjs` remains a small public snapshot for the Random and
Browse initial-HTML samples, independent of the new landing selections.

The database flags determine the Rare and Gothic selections. No public shared URL for that
album was supplied, so no personal album was fetched, exposed, or made indexable.

## Collective-nouns collection

The existing separate `collective_nouns` model and public `collective` response
supply a checked-in snapshot of 488 records. Duplicate expressions merge into 447
cards, preserving all source labels and highlights. The public page includes all
447 in initial HTML and provides browser-side searching, sorting, and an optional
collection-favorites filter. A highlighted hero expression persists per tab.

No category, attestation, or everyday-usage status is inferred from source labels.
The page explains that individual usage histories have not been assessed. The
model, data-quality findings, maintenance command, and remaining evidence work are
recorded in `docs/collective-nouns-proposal.md`. No database or API-server change
was needed. The old frontend component and draft remain reference material.

## Validation and next experiment

```bash
npm run build
node --test tools/seo.test.cjs
node tools/check-public-runtime.cjs
CI=true npm test -- --watch=false --runInBand --runTestsByPath src/public-content/PublicContent.test.js src/components/PageMetadata.test.js src/components/Random.test.js src/utils/public-navigation.test.js src/utils/workspace.test.js
netlify dev --offline --context production --dir build --framework '#static' --no-open --port 8888
node tools/check-public-http.mjs http://localhost:8888
```

The HTTP check verifies substantive no-JavaScript HTML, canonicals, public 200s,
unknown-route 404s, private noindex shells, all sitemap URLs, and legacy collective redirects.
Production and preview/branch artifacts are tested independently. No live deploy
or search-engine indexing submission is part of this change.

The production-bundle smoke test runs in jsdom with mocked API responses. It checks
direct mounting of all seven active public paths for both anonymous and signed-in
visitors, public navigation, Random loading, canonical updates, and the single
startup entry marker. It is not a visual browser/layout test.

After deployment, inspect the production HTML/statuses, submit the sitemap in free
Search Console, and use its query impressions/clicks alongside the existing
landing-log summary (`docs/landing-traffic.md`). The log measures document startups,
not unique visitors or engagement. To assess engagement without an analytics
service, review existing Random-refresh and album actions in API logs separately;
do not count them as additional landings. They are approximate activity indicators,
not a session-level attribution system. No new engagement logging is added here.

Primary technical references:

- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
- https://docs.netlify.com/manage/routing/redirects/redirect-options/
- https://docs.netlify.com/manage/routing/headers/

Deployment and Search Console setup: `docs/seo-deployment-checklist.md`.

## Internal layout and navigation

Internal pages share the landing covers’ 1180px desktop content measure, shrinking
to the viewport on phones. List containers and fixed page toolbars align to that
measure. The internal navigation drawer uses the same dark background, icon tiles,
and active-page treatment as the public drawer while preserving its existing
workspace-dependent options and navigation actions. Both drawers close with
Escape, their close button, or the backdrop. The internal masthead shortcuts and
account menu remain available.

## Editorial voice

WordMage is recreational: a place for logophiles to enjoy discoveries. Public
landing copy should invite curiosity and pleasure, rather than frame the site as
a writing aid, vocabulary course, or source of usage instructions. Gothic describes
the mood of the selected words. Keep metadata consistent with that purpose.

Rare Words presents “museum words”: distinctive verbal curiosities for a logophile’s
cabinet. Selection comes from `is_rare`, not a category of unnamed feelings,
exam vocabulary, or practical usage.

## Shared site navigation

The React app uses one centered logo/WordMage header, hamburger button, and account
control on public landing pages and interior pages. Both use the full interior
drawer, with workspace-dependent links retaining their existing visibility rules.
Interior pages replace the former header icon shortcuts with a fixed bottom text
bar: Random, Browse, Favorites, Albums, Share. Share retains each page’s existing
callback, disabled state, and contextual help. Page padding and bottom Add Word
controls leave clearance for the bar and device safe area. Public landing pages
keep their initial-HTML native menu, replaced by the shared app header on mount.
The isolated `/mock` route remains a noindex design study.
