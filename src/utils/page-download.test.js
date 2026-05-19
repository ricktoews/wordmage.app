import { buildWordListDownload, buildWordListPayload, formatWordListForDownload } from './page-download';

describe('page download helpers', () => {
	it('builds a word-definition payload from the current page', () => {
		const payload = buildWordListPayload([
			{ word: 'abditory', definition: 'a hidden place' },
			{ word: 'agelast', def: 'one who never laughs' },
			{ definition: 'missing word should be ignored' }
		]);

		expect(payload).toEqual([
			{ word: 'abditory', definition: 'a hidden place' },
			{ word: 'agelast', definition: 'one who never laughs' }
		]);
	});

	it('formats the payload as pretty-printed json', () => {
		const content = formatWordListForDownload([
			{ word: 'abditory', definition: 'a hidden place' }
		]);

		expect(content).toBe('[\n  {\n    "word": "abditory",\n    "definition": "a hidden place"\n  }\n]');
	});

	it('builds a stable filename from the page label', () => {
		const download = buildWordListDownload({
			label: 'Word Album Favorites',
			wordEntries: [{ word: 'abditory', definition: 'a hidden place' }]
		});

		expect(download.filename).toBe('word-album-favorites.json');
		expect(download.content).toBe('[\n  {\n    "word": "abditory",\n    "definition": "a hidden place"\n  }\n]');
	});
});