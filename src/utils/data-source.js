const starter = JSON.stringify({
	"custom": {},
	"active": {},
	"archived": {}
});
//localStorage.removeItem('my-words');
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
