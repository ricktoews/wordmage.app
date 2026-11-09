# Landing traffic from the existing API access log

The app captures `window.location.pathname` in `src/index.js`, before awaiting
workspace initialization or mounting React/BrowserRouter. Only that startup call
passes `entryPath` to `ensureActiveWorkspace`. For example, opening
`https://wordmage.app/albums?campaign=example#section` produces the existing request:

```text
POST /loadcustom?entry=%2Falbums
```

The POST body, authentication headers, and anonymous-user initialization stay the
same. Login, logout, registration, and other later workspace loads omit `entry`.
React route changes do not record landings. No extra network request or persistent
tracking identifier is added.

## Apache format

The deployed server configuration has **not been verified**. The standard Apache
combined format includes the original request line (`%r`), so it records the query:

```apache
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-agent}i\"" combined
CustomLog /path/to/wordmage-access.log combined
```

This is an example, not a proposed server configuration change. If the existing
dedicated log uses `combined` (or another format with `%r`), it already captures
`entry`. `%U` alone omits the query; `%U%q` includes it. A combined log entry will
look like:

```text
203.0.113.9 - - [08/Nov/2026:12:00:00 +0000] "POST /loadcustom?entry=%2Falbums HTTP/1.1" 200 123 "https://wordmage.app/" "Mozilla/5.0 ..."
```

The script below supports common, combined, and vhost-prefixed combined logs.
User-agent classification requires a combined log with its user-agent field.
Custom formats may require adapting the parser. Apache documents `%r`, `%q`, and
`%U` at https://httpd.apache.org/docs/2.4/mod/mod_log_config.html.

## Daily summary

Run with Python 3.9+ on the server or a downloaded copy of the dedicated API log:

```bash
python3 tools/landing-summary.py /path/to/wordmage-access.log --date 2026-11-08
```

Report your activity separately using your public IP (replace this example):

```bash
python3 tools/landing-summary.py /path/to/wordmage-access.log --date 2026-11-08 --own-ip 203.0.113.10
```

Add `--exclude-own` to omit your activity. Repeat `--own-ip` for multiple addresses;
CIDRs and IPv6 are accepted. IP-based exclusion also excludes others sharing that
IP, and must be updated when your public IP changes. A proxy's IP will not identify
individual visitors unless the log already records the actual client address.

Dates default to America/Los_Angeles, converting from the offset in each log line.
Use `--timezone UTC` for UTC reports. Omit `--date` to report all available days.
Include rotated logs explicitly if they span the reporting day; `.gz` is supported:

```bash
python3 tools/landing-summary.py /path/to/wordmage-access.log /path/to/wordmage-access.log.1 /path/to/wordmage-access.log.2.gz --date 2026-11-08
```

Pass each log once; the script does not deduplicate overlapping copies.
Output is CSV grouped by day and decoded entry pathname, with these columns:

- `human_looking`: successful requests without a recognized automation signature.
- `probable_bot`: successful requests with bot, crawler, headless-browser, monitoring,
  or common scripted-client user-agent signatures.
- `unknown`: successful requests with no user agent.
- `own`: successful requests from your specified IPs, reported separately.
- `failed`: marked startup requests with non-2xx responses, excluded from successful
  landing counts. `--exclude-own` also excludes your failed requests.

Only POSTs to `/loadcustom` with one valid `entry` pathname are included. Ordinary
API requests, preflight OPTIONS requests, legacy unmarked startup calls, and later
workspace loads are ignored. Percent decoding happens once, preserving any encoded
characters that were already part of the browser pathname.

## Interpretation

These are **application startups**, not unique visitors or sessions: refreshes,
new tabs, and repeat visits count again. Bots that execute JavaScript can appear;
bots that never initialize the app will not. Bots can also disguise their user
agent, so `human_looking` is not a verified human count. Inspect unusual bursts or
repeated IP/user-agent combinations separately when needed. Public `entry` values
can be forged; they are observational data, not trusted identity.

Visitors who block JavaScript/API requests or fail before reaching `/loadcustom`
are absent. The original pathname means the URL seen when the application script
starts; an earlier hosting-level HTTP redirect cannot be recovered by the UI.

This measures which pages visitors enter through, **not their acquisition source**.
Query strings (including campaign parameters) and fragments are deliberately absent.
The API Referer header usually identifies WordMage rather than the external search
engine. Use search-engine reporting separately to assess organic-search exposure.
