import { cloneJSON } from './helpers';
//import wordHash from '../data/word-list';
//import wordHash from '../data/luciferous';
// word-pool copied from toewsweb site_words table. Appears to have come from same source as luciferous.
//import wordHash from '../data/word-pool';
import DataSource from './data-source';
const userData = { custom: []};
//const userData = DataSource.retrieveUserData();

const WORD_POOL = [];

function initializeCustom(custom) {
	userData.custom = custom;
	console.log('initializeCustom', userData);
}

function getCustom() {
	return userData.custom;
}

async function initializeWordPool() {
	var response = await fetch('https://words-rest.toewsweb.net');
	var data = await response.json();
	WORD_POOL.push(...data);
	return data;
}

/**
 *
 */
const POOL_SIZE = 20;
function getRandomPool() {
	var wordList = fullWordList();
	var fullListClone = wordList.slice(0);
	var [notDislikedList, dislikedList] = separateDisliked(fullListClone);
	fullListClone = notDislikedList;
	var randomPool = [];
	for (let i = 0; i < POOL_SIZE; i++) {
		let ndx = Math.floor(Math.random() * fullListClone.length);
		randomPool.push(fullListClone[ndx]);
		fullListClone = fullListClone.filter((item, n) => n !== ndx);
	}
	return randomPool;
}

/**
 * Sort word objects by word
 */
function sortWordObj(a, b) {
	var result = 0;
	var aWord = a.word.toLowerCase();
	var bWord = b.word.toLowerCase();
	// localeCompare() takes care of accents.
	return a.word.localeCompare(b.word);
}

function separateDisliked(list) {
	var dislikedList = list.filter(wordObj => wordObj.dislike);
	var notDislikedList = list.filter(wordObj => !wordObj.dislike);
	return [notDislikedList, dislikedList];
}

/**
 * Full List is in { word: def } format.
 * We might want to return array instead.
 */
function fullWordList() {
	var universal = cloneJSON(WORD_POOL);
	var custom = userData.custom;
	var revisedCustom = [];
	custom.forEach(wordObj => {
		let ndx = universal.findIndex(item => item.word === wordObj.word);
		if (ndx === -1) {
			wordObj.myown = true;
			revisedCustom.push(wordObj);
		} else {
			universal[ndx]._id = wordObj._id;
			// Check for customized definition. Flag Word obj.
			if (wordObj.def !== universal[ndx].def) {
				wordObj.original = universal[ndx].def;
				universal[ndx].def = wordObj.def;
				wordObj.customDef = true;
			}
			// Fill in source.
			if (!wordObj.source) {
				wordObj.source = universal[ndx].source;
			}
			universal[ndx].tags = wordObj.tags;
			universal[ndx].spotlight = wordObj.spotlight;
			universal[ndx].dislike = wordObj.dislike;
			universal[ndx].learn = wordObj.learn;
		}
	});
	var [notDislikedList, dislikedList] = separateDisliked(universal);
	universal = notDislikedList;
	var fullList = [ ...revisedCustom, ...notDislikedList].sort(sortWordObj);
	fullList = [...fullList, {divider: true}, ...dislikedList];
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
		case 'dislike':
			list = userData.custom.filter(item => item.dislike);
			break;
		case 'learn':
			list = userData.custom.filter(item => item.learn);
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
		def: newWordObj.def,
		source: newWordObj.source,
		spotlight: newWordObj.spotlight,
		dislike: newWordObj.dislike,
		learn: newWordObj.learn
	};
	userData.custom.push(wordObj);
}

/**
 * Save custom definition.
 * If custom word isn't already listed, add it.
 * Maybe this needs to include the _id, to allow for modification of the word itself.
 */
function saveCustomDef(id, def) {
	var wordObjIndex = userData.custom.findIndex(item => item._id === id);
	let wordObj = userData.custom[wordObjIndex];
	if (def === '') {
		let builtInWord = cloneJSON(WORD_POOL.find(item => item.word === wordObj.word));
console.log('saveCustomDef', id, builtInWord);
		wordObj.def = builtInWord.def;
		wordObj.customDef = false;
	} else {
		wordObj.def = def;
		wordObj.customDef = true;
	}
	DataSource.saveUserData(userData);
	return wordObj;
}

/**
 * Save custom word.
 * If custom word isn't already listed, add it.
 * Maybe this needs to include the _id, to allow for modification of the word itself.
 */
function saveCustomWord(id, word, def, source, spotlight) {
	var wordObjIndex = userData.custom.findIndex(item => item._id === id);
	if (wordObjIndex === -1) {
		addCustomWord({ word, def, source, spotlight: true });
	} else {
		let wordObj = userData.custom[wordObjIndex];
		wordObj.word = word;
		wordObj.def = def;
		wordObj.source = source;
		if (def === wordObj.original) {
			delete wordObj.original;
			wordObj.customDef = false;
		}
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
console.log('deletecustomWord', wordId, userData.custom);
	DataSource.saveUserData(userData);
}

function undeleteCustomWord(wordObj) {
	userData.custom.push(wordObj);
console.log('undeletecustomWord', wordObj, userData.custom);
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
 * Adjust tags for selected word
 */
function updateTags(word, tags) {
	var wordObjIndex = userData.custom.findIndex(item => item.word === word);
	if (wordObjIndex === -1) {
		let builtInWord = cloneJSON(WORD_POOL.find(item => item.word === word));
		addCustomWord(builtInWord);
		wordObjIndex = userData.custom.findIndex(item => item.word === word);
	}
	var wordObj = userData.custom[wordObjIndex];
	wordObj.tags = tags;
	DataSource.saveUserData(userData);
}

/**
 * Toggle Spotlight status for specified word.
 */
function toggleSpotlight(word) {
	var wordObjIndex = userData.custom.findIndex(item => item.word === word);
	if (wordObjIndex === -1) {
		let builtInWord = cloneJSON(WORD_POOL.find(item => item.word === word));
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
 * Toggle Learn status for specified word.
 */
function toggleLearn(word) {
	var wordObjIndex = userData.custom.findIndex(item => item.word === word);
	if (wordObjIndex === -1) {
		let builtInWord = cloneJSON(WORD_POOL.find(item => item.word === word));
		addCustomWord(builtInWord);
		wordObjIndex = userData.custom.findIndex(item => item.word === word);
	}
	var wordObj = userData.custom[wordObjIndex];
	wordObj.learn = !wordObj.learn;
console.log('calling saveUserData', userData);
	DataSource.saveUserData(userData);
	// Create array of words from userData.active, which is an array of { word: notes }.
	var newLearnList = userData.custom.filter(item => item.learn);
console.log('newLearnList', newLearnList);
	return newLearnList;
}

/**
 * Toggle Dislike status for specified word.
 */
function toggleDislike(word) {
	var wordObjIndex = userData.custom.findIndex(item => item.word === word);
	if (wordObjIndex === -1) {
		let builtInWord = cloneJSON(WORD_POOL.find(item => item.word === word));
		addCustomWord(builtInWord);
		wordObjIndex = userData.custom.findIndex(item => item.word === word);
	}
	var wordObj = userData.custom[wordObjIndex];
	wordObj.dislike = !wordObj.dislike;
console.log('calling saveUserData', userData);
	DataSource.saveUserData(userData);
	// Create array of words from userData.active, which is an array of { word: notes }.
	var newDislikeList = userData.custom.filter(item => item.dislike);
console.log('newDislikeList', newDislikeList);
	return newDislikeList;
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
	var spotlightArray = userData.custom.filter(item => item.learn);
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
function saveNotes(id, notes) {
	var wordObjIndex = userData.custom.findIndex(item => item._id === id);
	let wordObj = userData.custom[wordObjIndex];
	wordObj.notes = notes;
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
	getCustom,
	initializeCustom,
	initializeWordPool,
	getRandomPool,
	getWordList,
	fullWordList,
	isCustom,
	saveCustomDef,
	saveCustomWord,
	deleteCustomWord,
	undeleteCustomWord,
	updateTags,
	getSpotlightList,
	isSpotlightEntry,
	toggleSpotlight,
	toggleDislike,
	toggleLearn,
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
