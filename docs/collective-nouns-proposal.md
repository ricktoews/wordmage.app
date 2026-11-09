# Collective Nouns: findings and proposal for review

Status: **not restored in the active public site**. The first request was truncated
before the instruction to report findings and a proposed implementation first.
The previously written draft is now excluded from routes, navigation, generated
HTML, the sitemap, and the application bundle. It has not been deployed.

## What survives

- Table: `collective_nouns`, separate from `word_pool`.
- Existing query in `wordmage-api/classes/Words.php`, `getCollective()`:
  `SELECT id, term, refers_to, expression, source, highlight FROM collective_nouns ORDER BY term`.
- Public data: `GET /get-words` returns an independent `collective` array. It
  changes `refers_to` to `refersTo`, returns boolean highlights, and omits IDs.
- Frontend: `src/components/CollectiveWords.js` and associated existing styles.
  Its initialization path is disabled. Its subject/term sorting, duplicate-source
  merging, and highlights behavior can be reused. Its default highlights-only view
  would hide most of the records; its old jump-to behavior also indexes the
  unsorted list while displaying the sorted list.

The logical columns are confirmed from code and public records. Exact SQL types,
constraints, and indexes remain unverified without database access. No database
or API-server changes have been made.

## Data quality

The public snapshot retrieved November 8, 2026 contains 488 records:

| Observation | Result |
| --- | --- |
| Source labels | 385 `Lipton 1977`; 103 `Book of St. Albans` |
| Required display fields | No empty term, subject, expression, or source values |
| Highlights | 23 records |
| Duplicate records | 41 by normalized term + subject + expression |
| Distinct expressions after merging | 447 |
| Animal/person categories | No reliable category field |
| Attestation or usage labels | No reliable evidence/status field |

Presence in a source collection is not proof of everyday usage, antiquity, or
scientific acceptance. Highlight flags indicate editorial selection, not
attestation. The records mix animal names with historical, humorous, and sometimes
unkind descriptions of people. Source-page references and historical context are
not consistently available in the API.

## Proposed modest implementation

1. Keep `collective_nouns` as the source of truth. Never migrate these records into
   `word_pool`. Use its separate public snapshot for build-time HTML and client
   search, avoiding a full word-pool download on every visit.
2. Restore `/collective-nouns` as a reference page. Browse all distinct expressions
   by subject, search animals/subjects/terms/expressions, sort by subject or term,
   and offer highlights as an optional filter. Merge duplicate expressions while
   retaining every recorded source label.
3. Keep existing source text and provenance visible. Do not infer an animal-only
   category from spelling, and do not call fanciful group names official.
4. Add a small, separate editorial evidence map keyed by the normalized expression
   (or database ID if a future public endpoint exposes it). No schema migration is
   needed for an initial experiment. Each reviewed entry needs a reference URL,
   a usage note, and one of these evidence descriptions:

| Proposed label | Required support |
| --- | --- |
| Documented usage | A checked dictionary entry or contextual usage citation |
| Historical attestation | A checked historical text/edition and location |
| Playful or literary construction | Source context explicitly supporting that description |
| Not yet verified | Default when only the current collection label is available |

These describe evidence, not a ranking of which expressions people should enjoy.
A playful construction may also have documented usage. A label should describe
what the citation establishes and avoid implying a stronger claim. Do not classify
all 488 automatically from source labels. Review a small starter selection before
promoting the feature, leaving the rest clearly unverified.

5. Once the presentation and evidence approach are reviewed, connect the restored
   page to navigation, include its canonical URL in the sitemap, and redirect old
   `/collective` URLs. Until then, preserve the old noindex shell and leave the new
   route inactive. Add direct-entry and evidence-label checks before activation.

The unshipped draft demonstrates search, sorting, highlights, and duplicate merging.
It does **not** implement verified per-entry evidence labels and is not proposed
as a finished restoration. Review should settle whether unverified records belong
in the default view or behind an explicit “Include unverified expressions” filter.
