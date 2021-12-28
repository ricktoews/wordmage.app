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
	const [ custom, setCustom ] = useState(getMyWords());

	const emailRef = useRef(null);
	const passwordRef = useRef(null);

	useEffect(async () => {
		if (emailRef.current) {
			emailRef.current.focus();
		}
	}, []);

	function getMyWords() {
		var tmpCustom = WordsInterface.getCustom();
		var liked = tmpCustom.filter(item => item.learn).sort((a, b) => a.word < b.word ? -1 : 1);
		return liked;
	}

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
		<div className="form">
	          <div className="input-field">
				<div className="icon-wrapper"><i className="glyphicon glyphicon-envelope"></i></div>
	            <input placeholder="Email" ref={emailRef} type="text" id="email" className="email" onChange={handleChange} onFocus={handleFocus} />
	          </div>
	          <div className="input-field">
				<div className="icon-wrapper"><i className="glyphicon glyphicon-lock"></i></div>
	            <input placeholder="Password" ref={passwordRef} type="text" id="password" className="password" onChange={handleChange} onFocus={handleFocus} />
	          </div>
	          <div className="button-wrapper">
	            <button className={'login-btn'} onClick={login}>Log in</button>
	          </div>
		      <div className="link-wrapper"><a href="/register">Not registered?</a></div>
		</div>
			) : (
			<div className="form">
	          <div>Logged in as {profileUser.email}</div>
	          <div className="button-wrapper">
	            <button className={'logout-btn'} onClick={logout}>Log out</button>
	          </div>

	          <div className="my-profile-content">
		        <h4>Words You're Learning</h4>
				{ custom.length > 0 ? (
	            <div className="my-words">
	            { custom.map((item, ndx) => {
	              return <div key={ndx}>{item.word}</div>
		        }) }
	            </div>
				) : <div>Nothing yet...</div> }
	          </div>

			</div>
			) }
	  </div>
	);
}	

export default Profile;
