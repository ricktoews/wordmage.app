function sanitizeFileStem(value) {
	return String(value || 'words')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'words';
}

function getDefinition(wordEntry) {
	return wordEntry?.definition || wordEntry?.def || wordEntry?.originalDef || '';
}

function buildWordListPayload(wordEntries = []) {
	return wordEntries
		.filter((wordEntry) => wordEntry?.word)
		.map((wordEntry) => ({
			word: wordEntry.word,
			definition: getDefinition(wordEntry)
		}));
}

function formatWordListForDownload(wordEntries = []) {
	return JSON.stringify(buildWordListPayload(wordEntries), null, 2);
}

function buildWordListDownload({ label, wordEntries }) {
	const content = formatWordListForDownload(wordEntries);
	const fileStem = sanitizeFileStem(label);
	return {
		content,
		filename: `${fileStem}.json`
	};
}

function downloadWordList({ label, wordEntries }) {
	const { content, filename } = buildWordListDownload({ label, wordEntries });
	const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	window.URL.revokeObjectURL(url);
	return { content, filename };
}

export { buildWordListDownload, buildWordListPayload, downloadWordList, formatWordListForDownload };