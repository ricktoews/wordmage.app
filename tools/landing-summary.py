#!/usr/bin/env python3
"""Summarize marked startup POSTs from Apache combined access logs (Python 3.9+)."""

import argparse
import csv
import gzip
import ipaddress
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime
from urllib.parse import parse_qs, urlsplit
from zoneinfo import ZoneInfo

LOG_LINE = re.compile(
    r'^(?:\S+ )?(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] '
    r'"(?P<request>(?:\\.|[^"\\])*)" (?P<status>\d{3}) \S+'
    r'(?: "(?:\\.|[^"\\])*" "(?P<agent>(?:\\.|[^"\\])*)")?\s*$'
)
BOT = re.compile(
    r'bot|crawler|spider|slurp|headless|selenium|playwright|puppeteer|'
    r'curl|wget|python|httpclient|go-http-client|monitor|uptime|lighthouse|'
    r'pagespeed|facebookexternalhit|googleother|bingpreview', re.I
)
MONTHS = {name: i for i, name in enumerate(
    ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'), 1
)}


def parse_landing(line, timezone):
    match = LOG_LINE.match(line)
    if not match:
        return None
    fields = match.groupdict()
    try:
        method, target, _ = fields['request'].split()
        url = urlsplit(target)
        entries = parse_qs(url.query).get('entry', [])
        if method != 'POST' or url.path != '/loadcustom' or len(entries) != 1:
            return None
        entry = entries[0]
        if not entry.startswith('/') or any(c in entry for c in '?#') or any(ord(c) < 32 or ord(c) == 127 for c in entry):
            return None
        # Parse English Apache month names independently of the machine's locale.
        day, month, rest = fields['time'].split('/', 2)
        stamp = datetime.strptime(f'{day}/{MONTHS[month]}/{rest}', '%d/%m/%Y:%H:%M:%S %z')
        date = stamp.astimezone(timezone).date().isoformat()
        return date, entry, fields['ip'], int(fields['status']), fields['agent'] or '-'
    except (ValueError, KeyError):
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('logs', nargs='+', help='Combined access logs, including rotated .gz files; - for stdin')
    parser.add_argument('--date', help='Only this date, YYYY-MM-DD, in the reporting timezone')
    parser.add_argument('--timezone', default='America/Los_Angeles')
    parser.add_argument('--own-ip', action='append', default=[], help='Your IP address or CIDR; repeat as needed')
    parser.add_argument('--exclude-own', action='store_true', help='Omit your activity instead of reporting it separately')
    args = parser.parse_args()
    try:
        timezone = ZoneInfo(args.timezone)
        networks = [ipaddress.ip_network(value, strict=False) for value in args.own_ip]
        if args.date:
            datetime.strptime(args.date, '%Y-%m-%d')
    except (ValueError, KeyError) as error:
        parser.error(str(error))

    counts = defaultdict(Counter)
    parsed_lines = 0
    for path in args.logs:
        opener = gzip.open if path.endswith('.gz') else open
        stream = sys.stdin if path == '-' else opener(path, 'rt', encoding='utf-8', errors='replace')
        try:
            for line in stream:
                if LOG_LINE.match(line):
                    parsed_lines += 1
                landing = parse_landing(line, timezone)
                if landing is None:
                    continue
                date, entry, client, status, agent = landing
                if args.date and date != args.date:
                    continue
                try:
                    address = ipaddress.ip_address(client)
                    own = any(address in network for network in networks)
                except ValueError:
                    own = False
                if own and args.exclude_own:
                    continue
                if not 200 <= status < 300:
                    bucket = 'failed'
                elif own:
                    bucket = 'own'
                elif BOT.search(agent):
                    bucket = 'probable_bot'
                elif agent == '-':
                    bucket = 'unknown'
                else:
                    bucket = 'human_looking'
                counts[(date, entry)][bucket] += 1
        finally:
            if stream is not sys.stdin:
                stream.close()

    if not parsed_lines:
        print('No recognized common/combined log lines; check the Apache LogFormat.', file=sys.stderr)
    columns = ['human_looking', 'probable_bot', 'unknown', 'own', 'failed']
    writer = csv.writer(sys.stdout)
    writer.writerow(['date', 'entry', *columns])
    for (date, entry), row in sorted(counts.items()):
        writer.writerow([date, entry, *(row[column] for column in columns)])


if __name__ == '__main__':
    main()
