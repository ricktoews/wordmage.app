import { cloneJSON } from './helpers';
//import wordHash from '../data/word-list';
//import wordHash from '../data/luciferous';
// word-pool copied from toewsweb site_words table. Appears to have come from same source as luciferous.
//import wordHash from '../data/word-pool';
import DataSource from './data-source';
import { CONFIG } from '../config';

const custom = DataSource.retrieveUserLocalData();
const userData = { custom, favoriteWords: [], albumIds: {} };

const WORD_POOL = [];
const COLLECTIVE = [];

function initializeCustom(albumIds = {}) {
    userData.albumIds = albumIds;
}

function setFavoriteWords(words = []) {
    userData.favoriteWords = words.map((fav) => ({
        ...fav,
        def: fav.definition || fav.def || ''
    }));
}

function getFavoriteWords() {
    return userData.favoriteWords || [];
}

function getCustom() {
    return userData.custom;
}

function getAlbumIds() {
    return userData.albumIds;
}

async function initializeWordPool() {
    var response = await fetch(CONFIG.domain + '/get-words');
    var data = await response.json();
    const mergedWordObjList = data.wordPool.reduce((acc, wordObj) => {
        const existing = acc.find(item => item.word === wordObj.word);
        if (existing) {
            // Word already exists, merge definitions and sources
            if (!existing.definitions) {
                existing.definitions = [existing.def];
                existing.sources = [existing.source];
            }
            existing.definitions.push(wordObj.def);
            existing.sources.push(wordObj.source);
        } else {
            acc.push({ ...wordObj });
        }
        return acc;
    }, []);

    WORD_POOL.push(...mergedWordObjList);
    if (data.collective) {
        COLLECTIVE.push(...data.collective);
    }
    return data.wordPool;
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

function collectiveWordList() {
    // Filter out any invalid items and sort by refersTo
    return COLLECTIVE.slice()
        .filter(item => item && item.term)
        .sort((a, b) => (a.refersTo || '').localeCompare(b.refersTo || ''));
}

/**
 * Full List is in { word: def } format.
 * We might want to return array instead.
 */
function fullWordList() {
    var universal = cloneJSON(WORD_POOL);
    //console.log('====> fullWordList - userData', userData);
    var custom = userData.custom;
    const liked = userData.favoriteWords || [];
    var revisedCustom = [];
    liked.forEach(fav => {
        let ndx = universal.findIndex(item => item.word === fav.word);
        if (ndx !== -1) {
            universal[ndx].favorite = true;
        }
    });

    custom.forEach(wordObj => {
        let ndx = universal.findIndex(item => item.word === wordObj.word);
        if (ndx === -1) {
            wordObj.myown = true;
            revisedCustom.push(wordObj);
        } else {
            universal[ndx]._id = wordObj._id;
            // Check for customized definition. Flag Word obj.
            if (wordObj.def !== universal[ndx].def) {
                wordObj.def = universal[ndx].def;
            }
            // Fill in source.
            if (!wordObj.source) {
                wordObj.source = universal[ndx].source;
            }
            universal[ndx].tags = wordObj.tags;
            universal[ndx].dislike = wordObj.dislike;
        }
    });
    var [notDislikedList, dislikedList] = separateDisliked(universal);
    universal = notDislikedList;
    var fullList = [...revisedCustom, ...notDislikedList].sort(sortWordObj);
    fullList = [...fullList, { divider: true }, ...dislikedList];
    return fullList;
}


/**
 * Get array of words.
 * Currently schizo: spotlight returns array, while full returns hash.
 */
function getWordList(type) {
    var list = [];
    switch (type) {
        case 'favorites':
            list = userData.favoriteWords || [];
            break;
        case 'dislike':
            list = userData.custom.filter(item => item.dislike);
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
        dislike: newWordObj.dislike
    };
    if (newWordObj.myown) {
        wordObj.myown = true;
    }
    userData.custom.push(wordObj);
}

/**
 * Save custom word.
 * If custom word isn't already listed, add it.
 * Maybe this needs to include the _id, to allow for modification of the word itself.
 */
function saveCustomWord(id, word, def, source) {
    var wordObjIndex = userData.custom.findIndex(item => item._id === id);
    if (wordObjIndex === -1) {
        addCustomWord({ word, def, source, myown: true });
    } else {
        let wordObj = userData.custom[wordObjIndex];
        wordObj.word = word;
        wordObj.def = def;
        wordObj.source = source;
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
 * Get Word object by word. For scrambled words.
 */
function getWordObjByWord(word) {
    var wordList = fullWordList();
    var fullListClone = wordList.slice(0);
    var wordObj = fullListClone.find(item => item.word === word);
    if (wordObj) {
        return wordObj;
    } else {
        console.log(word, 'not found');
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
    DataSource.saveUserData(userData);
    // Create array of words from userData.active, which is an array of { word: notes }.
    var newDislikeList = userData.custom.filter(item => item.dislike);
    return newDislikeList;
}

/**
 * Get random word from favorites list for unscramble game.
 */
function getUnscrambleItem() {
    var unscrambleItem = { word: '', def: '' };
    var favoritesArray = userData.favoriteWords || [];
    if (favoritesArray.length > 0) {
        var ndx = Math.floor(Math.random() * favoritesArray.length);
        unscrambleItem = favoritesArray[ndx];
    }
    console.log('getUnscrambleItem', unscrambleItem);
    return unscrambleItem;
}

function getUserData() {
    return userData;
}

function isWordLiked(word) {
    if (!word) return false;
    return userData.favoriteWords.some(item => item.word === word);
}

function addToLiked(wordObj) {
    if (!isWordLiked(wordObj.word)) {
        userData.favoriteWords.push({
            ...wordObj,
            def: wordObj.definition || wordObj.def || ''
        });
    }
}

function removeFromLiked(wordObj) {
    const wordToRemove = wordObj.word || '';
    if (!wordToRemove) return;
    userData.favoriteWords = userData.favoriteWords.filter(word => word.word !== wordToRemove);
}


const WordsInterface = {
    getCustom,
    getAlbumIds,
    initializeCustom,
    setFavoriteWords,
    getFavoriteWords,
    initializeWordPool,
    getRandomPool,
    getWordList,
    fullWordList,
    collectiveWordList,
    isCustom,
    saveCustomWord,
    deleteCustomWord,
    undeleteCustomWord,
    toggleDislike,
    getWordObjById,
    getWordObjByWord,
    getWordObj,
    getUnscrambleItem,
    getUserData,
    isWordLiked,
    addToLiked,
    removeFromLiked,
};

export default WordsInterface;
