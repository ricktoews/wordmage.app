import { itemToObj } from './helpers';
//import wordHash from '../data/word-list';
import wordHash from '../data/luciferous';
import DataSource from './data-source';

const userData = DataSource.retrieveUserData();
console.log('userData', userData);

function parseWordList() {
	var wordList;
	var sample = wordHash[0];
	if (sample.hasOwnProperty('word')){
		wordList = {};
		wordHash.forEach(item => {
			wordList[item.word] = item.def;
		});
	} else {
		wordList = wordHash;
	}

	return wordList;
}

function getWordList(type) {
	var list = [];
	switch (type) {
		case 'spotlight':
			list = userData.active;
			break;
		default:
			list = fullWordList();
	}
	return list;
}

function fullWordList() {
	var universal = parseWordList(wordHash);
	var custom = userData.custom;
	var fullList = { ...universal, ...custom };
	return fullList;
}

function saveCustomWord(word, def, spotlight) {
	userData.custom[word] = def;
	if (spotlight) {
		userData.active[word] = '';
	}
	DataSource.saveUserData(userData);
}

function deleteCustomWord(word) {
	delete userData.custom[word];
	delete userData.active[word];
	delete userData.archived[word];
	DataSource.saveUserData(userData);
}

function isCustom(word) {
	return !!userData.custom[word];
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
	console.log(word, 'not found');
	var fullList = fullWordList();
	if (fullList.hasOwnProperty(word)) {
		return { word, def: fullList[word] };
	} else {
		console.log(word, 'not found');
		return { word, def: '' };
	}
}

function getSpotlightItem() {
	var spotlightItem = { word: '', def: '' };
	var activeList = getActiveList();
	if (activeList.length > 0) {
		var ndx = Math.floor(Math.random() * activeList.length);
		var word = activeList[ndx];
		spotlightItem = getWordObj(word);
	}
	return spotlightItem;
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

function archiveWordList() {
	return userData.archived;
}

function archiveWord(word) {
	// Add word to archived
	userData.archived[word] = userData.active[word];
	// Delete word from active
	delete userData.active[word];
	// ...and save.
	DataSource.saveUserData(userData);
}

function getUserData() {
	return userData;
}

function replaceUserData(data) {
	DataSource.saveUserData(data);
	return data;
}

const WordsInterface = {
	getWordList,
	fullWordList,
	isCustom,
	saveCustomWord,
	deleteCustomWord,
	getActiveList,
	isActiveEntry,
	toggleActive,
	getActiveEntry,
	getWordObj,
	getSpotlightItem,
	saveNotes,
	getNotes,
	hasNotes,
	archiveWord,
	archiveWordList,
	getUserData,
	replaceUserData
};

export default WordsInterface;
