import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import WordsInterface from './utils/words-interface';
import { CONFIG } from './config';

async function initCustom(user_id) {
	console.log('====> initcustom', user_id);
	var options = {
		method: 'POST',
		headers: {'Content-type': 'application/json'},
		body: JSON.stringify({ user_id })
	};
	console.log('====> initcustom fetch', `${CONFIG.domain}/loadcustom`);
	var response = await fetch(`${CONFIG.domain}/loadcustom`, options);
	var custom = await response.json();
	if (!custom) custom = [];
	WordsInterface.initializeCustom(custom);
}

(async () => {
	var profile_user_id = localStorage.getItem('wordmage-profile-user_id');
	if (profile_user_id) {
		var response = await initCustom(profile_user_id);
	}
	await WordsInterface.initializeWordPool();
	ReactDOM.render(
	  <React.StrictMode>
	    <BrowserRouter><App /></BrowserRouter>
	  </React.StrictMode>,
	  document.getElementById('root')
	);
})();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
