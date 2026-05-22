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

function formatWordListForText({ label, wordEntries = [] }) {
	const items = buildWordListPayload(wordEntries);
	const title = String(label || 'Word List')
		.trim()
		.replace(/[-_]+/g, ' ')
		.replace(/\s+/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());

	if (items.length === 0) {
		return title;
	}

	return [
		title,
		'',
		...items.map(({ word, definition }) => `${word}. ${definition}`.trim())
	].join('\n');
}

function buildWordListDownload({ label, wordEntries }) {
	const content = formatWordListForDownload(wordEntries);
	const fileStem = sanitizeFileStem(label);
	return {
		content,
		filename: `${fileStem}.json`
	};
}

function buildWordListTextDownload({ label, wordEntries }) {
	const content = formatWordListForText({ label, wordEntries });
	const fileStem = sanitizeFileStem(label);
	return {
		content,
		filename: `${fileStem}.txt`
	};
	}

function downloadContent({ content, filename, mimeType }) {
	const blob = new Blob([content], { type: mimeType });
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	window.URL.revokeObjectURL(url);
	return { content, filename };
}

async function copyTextToClipboard(text) {
	if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(text);
		return true;
	}

	if (typeof document === 'undefined') {
		return false;
	}

	const textArea = document.createElement('textarea');
	textArea.value = text;
	textArea.setAttribute('readonly', '');
	textArea.style.position = 'fixed';
	textArea.style.opacity = '0';
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		return document.execCommand('copy');
	} finally {
		document.body.removeChild(textArea);
	}
}

function downloadWordList({ label, wordEntries }) {
	const { content, filename } = buildWordListDownload({ label, wordEntries });
	return downloadContent({ content, filename, mimeType: 'application/json;charset=utf-8' });
}

function downloadWordListAsText({ label, wordEntries }) {
	const { content, filename } = buildWordListTextDownload({ label, wordEntries });
	return downloadContent({ content, filename, mimeType: 'text/plain;charset=utf-8' });
}

export {
	buildWordListTextDownload,
	buildWordListDownload,
	buildWordListPayload,
	copyTextToClipboard,
	downloadWordListAsText,
	downloadWordList,
	formatWordListForDownload,
	formatWordListForText,
};