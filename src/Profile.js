import { useEffect, useRef, useState } from 'react';
import WordsInterface from './utils/words-interface';

function Profile(props) {

	const [ email, setEmail ] = useState('');
	const [ password, setPassword ] = useState('');
	const [ passwordConf, setPasswordConf ] = useState('');

	const emailRef = useRef(null);
	const passwordRef = useRef(null);

	useEffect(() => {
		emailRef.current.focus();
	}, []);

	const handleChange = e => {
		var el = e.target;
		switch (el.id) {
			case 'email':
				setEmail(el.value);
				break;
			case 'password':
				setPassword(el.value);
				break;
		}

		if (password && passwordConf) {
		}
		
	};

	const login = async () => {
		console.log('login', email, password);
		var options = {
			method: 'POST',
			headers: {'Content-type': 'application/json'},
			body: JSON.stringify({ email, password })
		};
		var response = await fetch('https://words-rest.toewsweb.net/login', options);
		var data = await response.json();
		var user_id = data.user_id;
		var user_custom = JSON.parse(data.custom);
		console.log('login custom', user_custom);
		WordsInterface.initializeCustom(user_custom);
	}

	return (
	  <div className="profile-form plain-content container">
	        <h3>Profile</h3>

	        <div className="email-field">
	          <label htmlFor="email">Email</label><input ref={emailRef} type="text" id="email" className="email" onChange={handleChange} />
	        </div>
	        <div className="password-field">
	          <label htmlFor="password">Password</label><input ref={passwordRef} type="text" id="password" className="password" onChange={handleChange} />
	        </div>
	        <div className="button-wrapper">
	          <button className={'badge badge-ok'} onClick={login}><i className="glyphicon glyphicon-ok"></i> Log in</button>
	        </div>
		    <a href="/register">Register</a>
	  </div>
	);
}	

export default Profile;
