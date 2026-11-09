# SEO deployment and Google Search Console

Nothing has been deployed or submitted to Search Console by this work.

## Before deployment

- Review the public copy and the separately deferred Collective Nouns proposal.
  The active canonical pages are `/`, `/rare-words`, `/gothic-vocabulary`, `/browse`,
  and `/about`. `/random` remains a working alias canonicalized to `/`.
- In Netlify, use the tracked `netlify.toml`: build command `npm run build`, publish
  directory `build`, functions directory `netlify/functions`. Do not deploy the
  `public` directory or run only `react-scripts build`, which omits static generation.
- Keep the existing application environment variables. Static content generation
  itself requires no API credentials or new environment variables.
- Run the build and focused checks documented in `docs/seo-foundation.md`.
- Check a Netlify deploy preview: HTML and response headers should say `noindex`,
  including after React navigation. Preview and branch-build sitemaps should have
  no URLs. A production-context build must have the five canonical sitemap URLs.
- Open each page on a narrow/mobile viewport. Check headings, readable word cards,
  navigation, Random refresh/undo, and popup behavior. Automated DOM checks do not
  substitute for this visual review.

## After deploying through the existing Netlify workflow

1. Verify HTTPS at `https://wordmage.app`. Open every active public route directly,
   including `/random`. Inspect **View Source** as well as the live DOM: meanings,
   introductory copy, title, description, canonical link, and public `href`s must
   already be in the response before JavaScript executes.
2. Check `/sitemap.xml` and `/robots.txt`. Every sitemap URL must resolve with HTTP
   200, reference `https://wordmage.app`, have matching canonical metadata, and lack
   `noindex`. Private routes, `/random`, and deferred `/collective-nouns` must not
   appear in the sitemap. The generated robots file advertises its sitemap.
3. Request a nonexistent route and `/rare-words/not-a-page`: both must return 404.
   Verify that `/albums`, `/login`, `/inbox`, and shared album URLs remain noindex.
   No private content should appear in generated public HTML.
4. In browser Network tools, open a fresh tab at `/rare-words?test=1#example`, then
   at `/gothic-vocabulary`. Expect exactly one startup POST per document to
   `/loadcustom?entry=%2Frare-words` or
   `/loadcustom?entry=%2Fgothic-vocabulary`, respectively. Neither entry value may
   contain `?test=1` or `#example`. Repeat signed out and signed in.
5. Follow ordinary public links after startup. They must use React navigation and
   generate no additional marked startup requests. CORS OPTIONS requests are
   preflights, not visits. The existing landing-summary script already ignores
   them and unmarked ordinary API calls; no Google Analytics or other tracker is
   introduced.
6. On the API log, confirm that the existing request-line field records the entry
   query and run `tools/landing-summary.py` as described in `docs/landing-traffic.md`.
   Local tests verify the frontend request and log-parser contract, not delivery
   to the live Apache log. No API-server access is needed to deploy the UI.

The reusable HTTP check can target production after deployment:

```bash
node tools/check-public-http.mjs https://wordmage.app
```

It checks every sitemap URL as well as canonical consistency, private noindex
responses, aliases, and real 404s. It is read-only but does make HTTP requests;
it does not execute JavaScript or create `loadcustom` landing records.

## Add WordMage to Search Console

1. Sign in at https://search.google.com/search-console and choose **Add property**.
2. Prefer a **Domain property** with `wordmage.app` (no scheme or path). Google
   requires DNS verification for this property type. Alternatively, a URL-prefix
   property for `https://wordmage.app/` can use Google's offered verification methods.
3. For DNS verification, copy the exact TXT record supplied by Google and add it
   at the domain's DNS provider. Use the host/name and value Google specifies;
   do not replace unrelated DNS records. Return to Search Console and verify after
   the record propagates. Keep the verification record in place afterward.
4. If using URL-prefix HTML-file verification instead, put Google's supplied file
   in `public/`, preserve its contents, rebuild, and deploy. Confirm that its exact
   URL returns the file rather than the app or a 404 before clicking Verify.
   Do not invent a verification token or add Analytics merely for verification.

Official guidance: [property types](https://support.google.com/webmasters/answer/34592),
[ownership verification](https://support.google.com/webmasters/answer/9008080).

## Submit the sitemap and inspect pages

1. After the production sitemap is live and ownership is verified, select the
   WordMage property and open **Sitemaps**.
2. Submit `https://wordmage.app/sitemap.xml` (or `sitemap.xml` if the property UI
   already supplies the URL prefix). Check the report for successful retrieval
   and any parsing errors. Submission tells Google the sitemap location; it does
   not upload it or guarantee that every page will be indexed.
3. Use **URL Inspection → Test live URL** for `/`, `/rare-words`, and
   `/gothic-vocabulary`. Check indexing eligibility and the tested HTML. Request
   indexing of these pages if appropriate. Do not submit preview URLs.
4. Let data accumulate. Compare non-brand query impressions/clicks and landing
   pages over several weeks. The Apache summary supplies startup counts by entry
   page, not unique visitors or search acquisition attribution. Existing refresh
   and album API activity may indicate engagement but should remain separate from
   landing counts.

Official guidance: [Sitemaps report](https://support.google.com/webmasters/answer/7451001).
