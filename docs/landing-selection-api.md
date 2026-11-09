# Landing vocabulary selections

The live endpoint is `POST /get-landing-page-words`, with JSON
`{"page":"rare","count":20}` or `{"page":"gothic","count":20}`.
It requires the existing signed-in or anonymous Bearer token. Both themes were
verified with anonymous authentication on November 8, 2026. Responses have
`success`, `page`, `count`, and `words`; records have `id`, `word`, `def`, and
`source`. The API performs the flag filtering; it does not return the flags.
The client validates the response and records membership from that contract.

Each page selects up to nine Rare or thirteen Gothic entries, including the first
as its featured word. The selected records live in sessionStorage separately per
theme. Navigation and document reloads reuse them without another themed request.
A fresh tab/session gets a fresh request; returning from another site in the same
tab retains the selection. Browsers may copy sessionStorage when duplicating a tab.
“Show different words” requests another twenty candidates, prefers unseen
entries, and changes the feature when multiple candidates are available. It cannot
guarantee wholly new words when the database pool is small.

Storage failure falls back to in-memory continuity. API failure retains the current
selection, or uses the checked-in snapshot on the first visit, with visible status.
No authentication or startup tracking logic changes. Themed requests have no
`entry` parameter and are not counted as landings by the existing summary script.

`src/public-content/landing-snapshot.json` contains actual themed API responses for
initial HTML and fallback. The build uses the same snapshot as the browser; it
makes no API calls and needs no credentials. Definitions and source labels are
rendered as text; Gothic categories and invented example sentences are omitted.

Refresh snapshots deliberately, review the resulting diff, and rebuild:

```bash
node tools/refresh-landing-snapshot.mjs --anonymous
npm run build
```

The explicit `--anonymous` command creates one anonymous workspace for authentication
and retrieves both themes. Alternatively set `WORDMAGE_SNAPSHOT_TOKEN` in the
environment (never commit it). The token stays in memory and is never logged or
written to the snapshot. Both responses must validate before the file is replaced.
Snapshots reflect flag membership when retrieved; refresh after changing flags
when those changes should also appear in initial HTML. Existing tab selections
remain stable until the visitor requests another selection or ends that session.
