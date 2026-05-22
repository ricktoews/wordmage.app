import { cloneJSON } from './helpers';
//import wordHash from '../data/word-list';
//import wordHash from '../data/luciferous';
// word-pool copied from toewsweb site_words table. Appears to have come from same source as luciferous.
//import wordHash from '../data/word-pool';
import DataSource from './data-source';
import { CONFIG } from '../config';
import { authFetch } from './auth';

const custom = DataSource.retrieveUserLocalData();
const userData = { custom, favoriteWords: [], albumIds: {}, browseHistory: [] };

const HISTORY_SETTINGS_STORAGE_KEY = 'wordmage.historyScoringSettings';
const DEFAULT_HISTORY_SCORING_SETTINGS = {
    scoreThreshold: 4,
    viewport3sMs: 3000,
    viewport6sMs: 6000,
    scrollStopVisibleMs: 180,
    signalSessionIdleMs: 2 * 60 * 1000,
    returnToWordIdleMs: 10 * 60 * 1000,
};

const SIGNAL_SCORES = {
    viewport_3s: 1,
    viewport_6s: 1,
    scroll_stop_visible: 2,
    tap_card: 3,
    menu_opened: 2,
    favorite_or_album: 10,
    returned_later: 4,
};

const signalStateByWord = {};

function clampNumber(value, min, max, fallback) {
    const asNumber = Number(value);
    if (!Number.isFinite(asNumber)) {
        return fallback;
    }
    return Math.min(max, Math.max(min, Math.round(asNumber)));
}

function sanitizeHistoryScoringSettings(settings = {}) {
    return {
        scoreThreshold: clampNumber(settings.scoreThreshold, 1, 50, DEFAULT_HISTORY_SCORING_SETTINGS.scoreThreshold),
        viewport3sMs: clampNumber(settings.viewport3sMs, 500, 20000, DEFAULT_HISTORY_SCORING_SETTINGS.viewport3sMs),
        viewport6sMs: clampNumber(settings.viewport6sMs, 1000, 30000, DEFAULT_HISTORY_SCORING_SETTINGS.viewport6sMs),
        scrollStopVisibleMs: clampNumber(settings.scrollStopVisibleMs, 50, 3000, DEFAULT_HISTORY_SCORING_SETTINGS.scrollStopVisibleMs),
        signalSessionIdleMs: clampNumber(settings.signalSessionIdleMs, 5000, 60 * 60 * 1000, DEFAULT_HISTORY_SCORING_SETTINGS.signalSessionIdleMs),
        returnToWordIdleMs: clampNumber(settings.returnToWordIdleMs, 30 * 1000, 24 * 60 * 60 * 1000, DEFAULT_HISTORY_SCORING_SETTINGS.returnToWordIdleMs),
    };
}

function getHistoryScoringSettings() {
    if (typeof localStorage === 'undefined') {
        return { ...DEFAULT_HISTORY_SCORING_SETTINGS };
    }

    try {
        const stored = localStorage.getItem(HISTORY_SETTINGS_STORAGE_KEY);
        if (!stored) {
            return { ...DEFAULT_HISTORY_SCORING_SETTINGS };
        }

        const parsed = JSON.parse(stored);
        return sanitizeHistoryScoringSettings({
            ...DEFAULT_HISTORY_SCORING_SETTINGS,
            ...(parsed || {}),
        });
    } catch (error) {
        return { ...DEFAULT_HISTORY_SCORING_SETTINGS };
    }
}

function setHistoryScoringSettings(nextSettings = {}) {
    const current = getHistoryScoringSettings();
    const merged = sanitizeHistoryScoringSettings({
        ...current,
        ...nextSettings,
    });

    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(HISTORY_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    }

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wordmage:historyScoringChanged', { detail: merged }));
    }

    return merged;
}

function resetHistoryScoringSettings() {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(HISTORY_SETTINGS_STORAGE_KEY);
    }

    const defaults = { ...DEFAULT_HISTORY_SCORING_SETTINGS };

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wordmage:historyScoringChanged', { detail: defaults }));
    }

    return defaults;
}

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
    var response = await authFetch(CONFIG.domain + '/get-words');
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

function getSignalStateForWord(word, now, signalSessionIdleMs) {
    const existingState = signalStateByWord[word];
    const shouldReset = !existingState || (now - existingState.lastSignalAt > signalSessionIdleMs);

    if (shouldReset) {
        signalStateByWord[word] = {
            score: 0,
            seenSignals: {},
            lastSignalAt: now,
            hasLoggedThisSession: false,
        };
    }

    return signalStateByWord[word];
}

/**
 * Add word to browse history. Track when user views a word.
 * Updates view count and timestamp if word already exists.
 */
function addToBrowseHistory(wordObj, source = 'browse', score = null) {
    if (!wordObj || !wordObj.word) return;

    const now = Date.now();
    const history = userData.browseHistory || [];
    const existing = history.find(h => h.word === wordObj.word);

    if (existing) {
        existing.viewCount = (existing.viewCount || 1) + 1;
        existing.lastViewedAt = now;
        existing.source = source || existing.source;
        if (typeof score === 'number') {
            existing.lastScore = score;
        }
    } else {
        history.push({
            word: wordObj.word,
            id: wordObj.id,
            def: wordObj.def || wordObj.definition || '',
            source: source,
            firstViewedAt: now,
            lastViewedAt: now,
            viewCount: 1,
            lastScore: typeof score === 'number' ? score : 0,
        });
    }

    userData.browseHistory = history;
}

/**
 * Weighted-interest detector. Signals accumulate per word and session.
 * A word is written to history once per session when score crosses threshold.
 */
function recordWordInterestSignal(wordObj, signal, source = 'browse') {
    if (!wordObj || !wordObj.word || !signal || !SIGNAL_SCORES[signal]) {
        return { logged: false, score: 0 };
    }

    const settings = getHistoryScoringSettings();
    const now = Date.now();
    const word = wordObj.word;
    const signalState = getSignalStateForWord(word, now, settings.signalSessionIdleMs);
    const history = userData.browseHistory || [];
    const existingHistory = history.find(item => item.word === word);

    if (
        existingHistory &&
        !signalState.seenSignals.returned_later &&
        (now - (existingHistory.lastViewedAt || 0) >= settings.returnToWordIdleMs)
    ) {
        signalState.score += SIGNAL_SCORES.returned_later;
        signalState.seenSignals.returned_later = true;
    }

    if (!signalState.seenSignals[signal]) {
        signalState.score += SIGNAL_SCORES[signal];
        signalState.seenSignals[signal] = true;
    }

    signalState.lastSignalAt = now;

    if (!signalState.hasLoggedThisSession && signalState.score >= settings.scoreThreshold) {
        addToBrowseHistory(wordObj, source, signalState.score);
        signalState.hasLoggedThisSession = true;
        return { logged: true, score: signalState.score };
    }

    return { logged: false, score: signalState.score };
}

/**
 * Get all words from browse history, sorted by most recent first
 */
function getBrowseHistory() {
    const history = userData.browseHistory || [];
    return history.slice().sort((a, b) => (b.lastViewedAt || 0) - (a.lastViewedAt || 0));
}

/**
 * Clear all browse history
 */
function clearBrowseHistory() {
    userData.browseHistory = [];
}

/**
 * Remove specific word from browse history
 */
function removeFromBrowseHistory(word) {
    const history = userData.browseHistory || [];
    userData.browseHistory = history.filter(h => h.word !== word);
    delete signalStateByWord[word];
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
    getHistoryScoringSettings,
    setHistoryScoringSettings,
    resetHistoryScoringSettings,
    recordWordInterestSignal,
    addToBrowseHistory,
    getBrowseHistory,
    clearBrowseHistory,
    removeFromBrowseHistory,
};

export default WordsInterface;
