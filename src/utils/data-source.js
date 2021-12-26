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
const starter = JSON.stringify({
	"custom": []
});

//localStorage.removeItem('my-words');

/**
 * Get user data from local storage. Return it in original format.
 */
function retrieveUserLocalData() {
	var myWords = localStorage.getItem('my-words') || starter;
	try {
		var userData = JSON.parse(myWords);
	} catch(e) {
		console.log('Oops', myWords, e);
		userData = JSON.parse(starter);
	}

	return userData;
}

function retrieveUserData() {
	var myWords = localStorage.getItem('my-words') || starter;
	try {
		var userData = JSON.parse(myWords);
	} catch(e) {
		console.log('Oops', myWords, e);
		userData = { custom: [] };
	}

	return userData;
}

async function saveUserData(userData) {
	var custom = userData.custom;
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
			var response = fetch('https://words-rest.toewsweb.net/savecustom', options);
		} catch (e) {
			console.log('Problem saving', userData, e);
		}
	}
}

const DataSource = { retrieveUserLocalData, retrieveUserData, saveUserData };

export default DataSource;
