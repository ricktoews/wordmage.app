import { useEffect, useRef, useState } from 'react';
import DataSource from './utils/data-source';
const userLocalData = DataSource.retrieveUserLocalData();

function Register(props) {

	const [ email, setEmail ] = useState('');
	const [ password, setPassword ] = useState('');
	const [ passwordConf, setPasswordConf ] = useState('');

	const emailRef = useRef(null);
	const passwordRef = useRef(null);

	useEffect(() => {
		console.log('focus email field');
		emailRef.current.focus();
	}, []);

	const handleChange = e => {
		var el = e.target;
		switch (el.id) {
			case 'register-email':
				setEmail(el.value);
				break;
			case 'register-password':
				setPassword(el.value);
				break;
		}

	};

	const register = async () => {
		console.log('register', email, password, userLocalData);
		var payload = { email, password, userData: userLocalData };
		var options = {
			method: 'post',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify(payload)
		};
		var response = await fetch('https://words-rest.toewsweb.net/register', options);
		var data = await response.json();
		console.log('register', data);
	}

	return (
	  <div className="profile-form plain-content container">
	    <h3>Register</h3>
	    <p>Why register? No need, unless you want to be able to view your word list choices (likes, words to learn, &c.) on another device. To do that, you need to be able to identify yourself. Which can't happen unless you're registered.</p>
	    <div className="form">
	      <div className="input-field">
	        <div className="icon-wrapper"><i className="glyphicon glyphicon-envelope"></i></div>
	        <input placeholder="Email" ref={emailRef} type="email" id="register-email" className="register-email" onChange={handleChange} />
	      </div>
	      <div className="input-field">
	        <div className="icon-wrapper"><i className="glyphicon glyphicon-lock"></i></div>
	        <input placeholder="Password" ref={passwordRef} type="text" id="register-password" className="register-password" onChange={handleChange} />
	      </div>
{/*
	        <div className="password-confirmation-field">
	          <label htmlFor="password">Confirm</label><input type="text" id="register-password-confirmation" className="register-password" onChange={handleChange} />
	        </div>
*/}
	      <div className="button-wrapper">
	        <button className={'register-btn'} onClick={register}>Register</button>
	      </div>
	    </div>
	  </div>
	);
}	

export default Register;
