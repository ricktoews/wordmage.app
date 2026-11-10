import importlib.util
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from zoneinfo import ZoneInfo

SCRIPT = Path(__file__).with_name('landing-summary.py')
spec = importlib.util.spec_from_file_location('landing_summary', SCRIPT)
summary = importlib.util.module_from_spec(spec)
spec.loader.exec_module(summary)


def line(target='/loadcustom?entry=%2Falbums', method='POST', ip='203.0.113.9', agent='Mozilla/5.0', status=200):
    return f'{ip} - - [08/Nov/2026:03:00:00 +0000] "{method} {target} HTTP/1.1" {status} 123 "-" "{agent}"\n'


class LandingSummaryTests(unittest.TestCase):
    def test_public_entry_paths_and_preflights(self):
        for route in ['/', '/random', '/rare-words', '/gothic-vocabulary', '/collective-nouns', '/browse', '/about']:
            from urllib.parse import urlencode
            target = '/loadcustom?' + urlencode({'entry': route})
            self.assertEqual(summary.parse_landing(line(target), ZoneInfo('UTC'))[1], route)
            self.assertIsNone(summary.parse_landing(line(target, method='OPTIONS'), ZoneInfo('UTC')))

    def test_only_marked_startup_posts_count(self):
        for text in [line('/loadcustom'), line(method='OPTIONS'), line('/albums?entry=%2Falbums'), line('/loadcustom?entry=https%3A%2F%2Fexample.com'), line('/loadcustom?entry=%2F%0Aevil')]:
            self.assertIsNone(summary.parse_landing(text, ZoneInfo('UTC')))

    def test_timezone_and_decoding(self):
        parsed = summary.parse_landing(line('/loadcustom?entry=%2Fwords%2Fcaf%25C3%25A9'), ZoneInfo('America/Los_Angeles'))
        self.assertEqual(parsed[:2], ('2026-11-07', '/words/caf%C3%A9'))
        vhost = summary.parse_landing('wordmage.toews-api.com:443 ' + line(), ZoneInfo('UTC'))
        self.assertEqual(vhost[2], '203.0.113.9')

    def test_report_separates_bots_own_activity_and_errors(self):
        with tempfile.NamedTemporaryFile(mode='w', suffix='.log') as log:
            log.write(line() + line(agent='Googlebot') + line(ip='198.51.100.1') + line(status=401) + line('/loadcustom'))
            log.flush()
            command = [sys.executable, str(SCRIPT), log.name, '--date', '2026-11-07', '--own-ip', '198.51.100.0/24']
            result = subprocess.run(command, capture_output=True, text=True, check=True)
            self.assertIn('2026-11-07,/albums,1,1,0,1,1', result.stdout)
            excluded = subprocess.run(command + ['--exclude-own'], capture_output=True, text=True, check=True)
            self.assertIn('2026-11-07,/albums,1,1,0,0,1', excluded.stdout)


if __name__ == '__main__':
    unittest.main()
