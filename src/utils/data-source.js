/*
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
	"custom": [/*{
		_id: 1,
		word: 'a cheval',
		spotlight: true
	}*/]
});
//localStorage.removeItem('my-words');

/**
 * Get user data from local storage. Return it in original format.
 */
function retrieveUserData() {
	var myWords = localStorage.getItem('my-words') || starter;
	try {
		var userData = JSON.parse(myWords);
	} catch(e) {
		console.log('Oops', myWords, e);
	}

	return userData;
}

function saveUserData(userData) {
	try {
		var myWords = JSON.stringify(userData);
		localStorage.setItem('my-words', myWords);
	} catch (e) {
		console.log('Problem saving', userData, e);
	}
}

const DataSource = { retrieveUserData, saveUserData };

export default DataSource;
