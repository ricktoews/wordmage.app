import { useEffect, useRef, useState } from 'react';
import WordsInterface from './utils/words-interface';

function Profile(props) {
	var profile_user_id = localStorage.getItem('wordmage-profile-user_id');
	var profile_email = localStorage.getItem('wordmage-profile-email');
	var profileObj = { user_id: profile_user_id, email: profile_email };
	const [ email, setEmail ] = useState('');
	const [ password, setPassword ] = useState('');
	const [ passwordConf, setPasswordConf ] = useState('');
	const [ message, setMessage ] = useState('');
	const [ profileUser, setProfileUser ] = useState(profileObj);

	const emailRef = useRef(null);
	const passwordRef = useRef(null);

	useEffect(async () => {
		if (emailRef.current) {
			emailRef.current.focus();
		}
		/*
		else {
			var options = {
				method: 'POST',
				headers: {'Content-type': 'application/json'},
				body: JSON.stringify({ user_id: userId })
			};
			var response = await fetch('https://words-rest.toewsweb.net/loadcustom', options);
			var data = await response.json();
			setCustomData(data);
		}
		*/
	}, []);

	const setCustomData = custom => {
		var user_custom = JSON.parse(custom);
		WordsInterface.initializeCustom(user_custom);
	}

	const handleFocus = e => {
		setMessage('');
	}

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

	const logout = () => {
		setProfileUser({});
		localStorage.removeItem('wordmage-profile-user_id');
		localStorage.removeItem('wordmage-profile-email');
		console.log('Removed user ID');
	}

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
		if (user_id == -1) {
			setMessage("The email / password combo you used isn't registered. Try again?");
		}
		else {
			setProfileUser({ user_id, email });
			localStorage.setItem('wordmage-profile-user_id', user_id);
			localStorage.setItem('wordmage-profile-email', email);
		}
		if (data.custom) {
			setCustomData(data.custom);
		}
	}

	return (
	  <div className="profile-form plain-content container">
	        <h3>Profile</h3>
	        { message === '' ? null : <div className="profile-form-message">{message}</div> }

	        { !profileUser.user_id ? (
			<div className="profile-fields">
	          <div className="email-field">
	            <label htmlFor="email">Email</label><input ref={emailRef} type="text" id="email" className="email" onChange={handleChange} onFocus={handleFocus} />
	          </div>
	          <div className="password-field">
	            <label htmlFor="password">Password</label><input ref={passwordRef} type="text" id="password" className="password" onChange={handleChange} onFocus={handleFocus} />
	          </div>
	          <div className="button-wrapper">
	            <button className={'badge badge-ok'} onClick={login}><i className="glyphicon glyphicon-ok"></i> Log in</button>
	          </div>
		      <div><a href="/register">Not registered?</a></div>
	        </div>
			) : (
			<div>
	          <div>Logged in as {profileUser.email}</div>
	          <div className="button-wrapper">
	            <button className={'badge badge-ok'} onClick={logout}><i className="glyphicon glyphicon-ok"></i> Log out</button>
	          </div>

			</div>
			) }
	  </div>
	);
}	

export default Profile;
