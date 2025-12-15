/*
 * This schema for custom is way out of date.
{ 
    custom: [
        _id: <int>,
        word: <string>,
        def: <string>,
        notes: <string>,
        spotlight: <boolean>
    ]
}
 */

import { CONFIG } from '../config';

const starter = JSON.stringify([]);

//localStorage.removeItem('my-words');

/**
 * Get user data from local storage. Return it in original format.
 */
function retrieveUserLocalData() {
    var myWords = localStorage.getItem('my-words') || starter;
    try {
        var userData = JSON.parse(myWords);
    } catch (e) {
        console.log('Oops', myWords, e);
        userData = JSON.parse(starter);
    }

    return userData;
}

function retrieveUserData() {
    var myWords = localStorage.getItem('my-words') || starter;
    try {
        var userData = JSON.parse(myWords);
    } catch (e) {
        console.log('Oops', myWords, e);
        userData = { custom: [] };
    }

    return userData;
}

function cleanCustomWords(custom) {
    custom = custom.map(item => {
        // Don't know why this was done, but it's removing the definition when we trigger a Save from the Learn / Like page.
        // 2025-06-04: Comment out until / unless we can defend it and find an alternate approach.
        /*
        if (!item.myown) {
            delete item.def;
            delete item.source;
        }
        */
        if (item.tags && item.tags.length === 0) {
            delete item.tags;
        }
        return item;
    });
    custom = custom.filter(item => {
        if (item.myown || item.tags || item.spotlight || item.learn || item.dislike) {
            return true;
        }
    });
    return custom;
}

async function saveUserData(userData) {
    var custom = cleanCustomWords(userData.custom);
    localStorage.setItem('my-words', JSON.stringify(custom));

    // If logged in profile, save custom list to database.
    var profile_user_id = localStorage.getItem('wordmage-profile-user_id');
    var profile_email = localStorage.getItem('wordmage-profile-email');
    if (profile_user_id) {
        try {
            var options = {
                method: 'post',
                header: { 'Content-type': 'application/json' },
                body: JSON.stringify({ user_id: profile_user_id, custom })
            };
            var response = fetch(`${CONFIG.domain}/savecustom`, options);
        } catch (e) {
            console.log('Problem saving', userData, e);
        }
    }
}

async function saveTrainingData() {
    var training = JSON.parse(localStorage.getItem('my-training-room') || '[]');

    // If logged in profile, save training list to database.
    var profile_user_id = localStorage.getItem('wordmage-profile-user_id');
    if (profile_user_id) {
        try {
            var options = {
                method: 'post',
                header: { 'Content-type': 'application/json' },
                body: JSON.stringify({ user_id: profile_user_id, training })
            };
            var response = fetch(`${CONFIG.domain}/savetraining`, options);
        } catch (e) {
            console.log('Problem saving training data', e);
        }
    }
}

const DataSource = { retrieveUserLocalData, retrieveUserData, saveUserData, saveTrainingData };

export default DataSource;

