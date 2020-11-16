import { itemToObj } from './helpers';
import wordHash from '../data/word-list';
import DataSource from './data-source';

const userData = DataSource.retrieveUserData();
console.log('userData', userData);

function fullWordList() {
	var universal = wordHash;
	var custom = userData.custom;
	var fullList = { ...universal, ...custom };

	return fullList;
}

function saveCustomWord(word, def) {
	userData.custom[word] = def;
	DataSource.saveUserData(userData);
}

function getActiveList() {
	var newActiveList = Object.keys(userData.active);
	return newActiveList;
}

function toggleActive(word) {
	if (!isActiveEntry(word)) {
		userData.active[word] = '';
	} else {
		delete userData.active[word];
		console.log('userData.active', userData.active);
	}

	DataSource.saveUserData(userData);
	// Create array of words from userData.active, which is an array of { word: notes }.
	var newActiveList = userData.active;
	return newActiveList;
}

function isActiveEntry(word) {
	var entry = userData.active[word] !== undefined;
	return !!entry;
}

function getActiveEntry(word) {
	var entry = { [word]: userData.active[word] } || {[word]: ''};
	return entry;
}

function getWordObj(word) {
	var fullList = fullWordList();
	if (fullList[word]) {
		return { word, def: fullList[word] };
	} else {
		console.log(word, 'not found');
		return {};
	}
}

function saveNotes(word, notes) {
	userData.active[word] = notes;
	DataSource.saveUserData(userData);
	console.log('updated userData', userData);
}

function getNotes(word) {
	var notes = userData.active[word] || '';
	return notes;
}

function hasNotes(word) {
	var result = userData.active[word] !== undefined && userData.active[word].length > 0;
	return result;
}

function archiveWord(word) {
	console.log('archiveWord', word);
	userData.archived[word] = userData.active[word];
	delete userData.active[word];
	DataSource.saveUserData(userData);
}

const WordsInterface = {
	fullWordList,
	saveCustomWord,
	getActiveList,
	isActiveEntry,
	toggleActive,
	getActiveEntry,
	getWordObj,
	saveNotes,
	getNotes,
	hasNotes,
	archiveWord
};

export default WordsInterface;
