import { itemToObj } from './helpers';
//import wordHash from '../data/word-list';
import wordHash from '../data/luciferous';
import DataSource from './data-source';

const userData = DataSource.retrieveUserData();
console.log('userData', userData);

/**
 * Sort word objects by word
 */
function sortWordObj(a, b) {
	var result = 0;
	var aWord = a.word.toLowerCase();
	var bWord = b.word.toLowerCase();
	if (aWord < bWord) {
		result = -1;
	} else if (bWord < aWord) {
		result = 1;
	}
	return result;
}

/**
 * Return word list in { word: def } format.
 */
function parseWordList() {
	var wordList;
	var sample = wordHash[0];
	if (sample.hasOwnProperty('word')){
		wordList = wordHash;
/*
		wordList = {};
		wordHash.forEach(item => {
			wordList[item.word] = item.def;
		});
*/
	} else {
		wordList = wordHash;
	}

	return wordList;
}

/**
 * Full List is in { word: def } format.
 * We might want to return array instead.
 */
function fullWordList() {
	var universal = parseWordList(wordHash);
	var custom = userData.custom;
	var revisedCustom = [];
	custom.forEach(wordObj => {
		let ndx = universal.findIndex(item => item.word === wordObj.word);
		if (ndx === -1) {
			revisedCustom.push(wordObj);
		} else {
			universal[ndx].def = wordObj.def;
			universal[ndx].spotlight = wordObj.spotlight;
		}
	});
	var fullList = [ ...revisedCustom, ...universal].sort(sortWordObj);
	return fullList;
}


/**
 * Get array of words.
 * Currently schizo: spotlight returns array, while full returns hash.
 */
function getWordList(type) {
	var list = [];
	switch (type) {
		case 'spotlight':
			list = userData.custom.filter(item => item.spotlight);
			break;
		default:
			list = fullWordList();
	}
	return list;
}

function addCustomWord(newWordObj) {
	var idList = userData.custom.map(item => item._id);
	var maxId = idList.length ? Math.max(...idList) : 0;
	var newId = maxId + 1;
	let wordObj = {
		_id: newId,
		word: newWordObj.word,
		def: newWordObj.def
	};
	userData.custom.push(wordObj);
}

/**
 * Save custom word.
 * If custom word isn't already listed, add it.
 * Maybe this needs to include the _id, to allow for modification of the word itself.
 */
function saveCustomWord(id, word, def, spotlight) {
	var wordObjIndex = userData.custom.findIndex(item => item._id === id);
	if (wordObjIndex === -1) {
		addCustomWord({ word, def });
	} else {
		let wordObj = userData.custom[wordObjIndex];
		wordObj.word = word;
		wordObj.def = def;
		wordObj.spotlight = spotlight;
	}
	DataSource.saveUserData(userData);
}

/**
 * Remove specified word from custom list.
 * Array.splice(start, quantity);
 */
function deleteCustomWord(wordId) {
	var wordObjIndex = userData.custom.findIndex(item => item._id === wordId);
	userData.custom.splice(wordObjIndex, 1);
	DataSource.saveUserData(userData);
}

/**
 * Return true / false, depending on whether or not the specified word is on the custom list.
 */
function isCustom(word) {
	var wordObj = userData.custom.find(item => item.word === word);
	return !!wordObj;
}

/**
 * Get Word object by ID. For custom words.
 */
function getWordObjById(id) {
	var wordObj = userData.custom.find(item => item._id === id);
	if (wordObj) {
		return wordObj;
	} else {
		console.log(id, 'not found');
		return { word: '', def: '' };
	}
}

/**
 * How does this need to work?
 * Full list includes built-in list and user customizations (added / modified).
 * Since custom word list is [ { word: [word], def: [def] }, ... ], shoudn't built-in list be the same? 
 */
function getWordObj(word) {
	var fullList = fullWordList();
	var wordObj = fullList.find(item => item.word === word);
	if (wordObj) {
		return wordObj;
	} else {
		console.log(word, 'not found');
		return { word, def: '' };
	}
}

/**
 * Toggle Spotlight status for specified word.
 */
function toggleSpotlight(word) {
	var wordObjIndex = userData.custom.findIndex(item => item.word === word);
	if (wordObjIndex === -1) {
		let builtInWord = wordHash.find(item => item.word === word);
		addCustomWord(builtInWord);
		wordObjIndex = userData.custom.findIndex(item => item.word === word);
	}
	var wordObj = userData.custom[wordObjIndex];
	wordObj.spotlight = !wordObj.spotlight;
	DataSource.saveUserData(userData);
	// Create array of words from userData.active, which is an array of { word: notes }.
	var newSpotlightList = userData.custom.filter(item => item.spotlight);
	return newSpotlightList;
}

/**
 * Return true / false, depending on whether or not the word is Spotlighted.
 */
function isSpotlightEntry(word) {
	var wordObjIndex = userData.custom.findIndex(item => item.word === word);
	var wordObj = wordObjIndex !== -1 ? userData.custom[wordObjIndex] : {};
	var result = wordObj.spotlight;
	return !!result;
}

/**
 * Get Spotlight word. { word: obj }
 * Do we need to revise this?
 */
function getSpotlightEntry(word) {
	var wordObj = userData.custom.find(item => item.word === word);
	var entry = { [word]: wordObj };
	return entry;
}

/**
 * Get list of Spotlight words.
 */
function getSpotlightList() {
	var spotlightArray = userData.custom.filter(item => item.spotlight);
	return spotlightArray;
}

/**
 * Get random spotlight item.
 */
function getSpotlightItem() {
	var spotlightItem = { word: '', def: '' };
	var spotlightArray = getSpotlightList();
	if (spotlightArray.length > 0) {
		var ndx = Math.floor(Math.random() * spotlightArray.length);
		spotlightItem = spotlightArray[ndx];
	}
	return spotlightItem;
}

/**
 * Save notes for word in custom list.
 */
function saveNotes(word, notes) {
	var wordObjNdx = userData.custom.findIndex(item => item.word === word);
	userData.custom[wordObjNdx].notes = notes;
	DataSource.saveUserData(userData);
	console.log('updated userData', userData);
}

/**
 * If word has notes, return them; otherwise, return empty string.
 */
function getNotes(word) {
	var wordObj = userData.custom.find(item => item.word === word);
	var notes = wordObj && wordObj.notes || '';
	return notes;
}

/**
 * Return true / false. Check custom array for a) word, and b) whether or not word has notes.
 */
function hasNotes(word) {
	var wordObj = userData.custom.find(item => item.word === word);
	var result = wordObj && wordObj.notes && wordObj.notes.lenghth > 0;
	return !!result;
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
	getSpotlightList,
	isSpotlightEntry,
	toggleSpotlight,
	getSpotlightEntry,
	getWordObjById,
	getWordObj,
	getSpotlightItem,
	saveNotes,
	getNotes,
	hasNotes,
	getUserData,
	replaceUserData
};

export default WordsInterface;
