import { useEffect, useRef, useState } from 'react';
import WordsInterface from './utils/words-interface';
import { CONFIG } from './config';

function Profile(props) {
	var profile_user_id = localStorage.getItem('wordmage-profile-user_id');
	var profile_email = localStorage.getItem('wordmage-profile-email');
	var profileObj = { user_id: profile_user_id, email: profile_email };
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConf, setPasswordConf] = useState('');
	const [message, setMessage] = useState('');
	const [profileUser, setProfileUser] = useState(profileObj);
	const [custom, setCustom] = useState(getMyWords());
	const [clickedWord, setClickedWord] = useState('');
	const [clickedDef, setClickedDef] = useState('');

	const emailRef = useRef(null);
	const passwordRef = useRef(null);
	const clickedWordRef = useRef(null);
	const profileFormRef = useRef(null);

	useEffect(() => {
		if (emailRef.current) {
			emailRef.current.focus();
		}
	}, []);

	// If redirected back from Google, the callback includes a base64 payload
	// in the `google_user` query param. Read it, populate localStorage and
	// initialize profile state.
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const gu = params.get('google_user');
		if (gu) {
			try {
				const decoded = JSON.parse(decodeURIComponent(atob(gu)));
				if (decoded && decoded.email) {
					setProfileUser({ user_id: decoded.provider_id, email: decoded.email });
					localStorage.setItem('wordmage-profile-user_id', decoded.provider_id);
					localStorage.setItem('wordmage-profile-email', decoded.email);
					setMessage('Signed in with Google');

					// Attempt to load the user's customizations from the server
					// by calling the same login endpoint used for email/password logins.
					// We send a `google: true` flag so the backend can treat this as
					// an OAuth-based lookup. Backend must support this behavior; if it
					// doesn't, you'll need to add a server endpoint that returns custom
					// data for the provided email when authenticated via Google.
					(async () => {
						try {
							const resp = await fetch(`${CONFIG.domain}/login`, {
								method: 'POST',
								headers: { 'Content-type': 'application/json' },
								body: JSON.stringify({ email: decoded.email, google: true })
							});
							const data = await resp.json();
							if (data.custom) {
								setCustomData(data.custom);
								setMessage('Signed in with Google — customizations loaded');
							} else {
								setMessage('Signed in with Google');
							}
							if (data.user_id) {
								// If backend returns a user_id, ensure local state matches it
								setProfileUser({ user_id: data.user_id, email: decoded.email });
								localStorage.setItem('wordmage-profile-user_id', data.user_id);
							}
						} catch (err) {
							console.error('Failed to load customizations after Google sign-in', err);
							setMessage('Signed in with Google (failed to load customizations)');
						}
					})();
				}
			} catch (err) {
				console.error('Failed to parse google_user payload', err);
			}
			// Remove the param from the URL using router history (avoid global `history`)
			params.delete('google_user');
			const newUrl = window.location.pathname + (params.toString() ? ('?' + params.toString()) : '');
			if (props && props.history && typeof props.history.replace === 'function') {
				props.history.replace(newUrl);
			} else {
				window.history.replaceState({}, '', newUrl);
			}
		}
	}, []);

	useEffect(() => {
		if (profileFormRef.current) {
			console.log('profile form', profileFormRef.current);
			profileFormRef.current.addEventListener('click', handleProfileFormClick);
		}
	}, []);

	function handleProfileFormClick(e) {
		var el = e.target;
		var elClasses = Array.from(el.classList);
		console.log('profile form clicked', elClasses);
		if (elClasses.indexOf('my-word') === -1) {
			clickedWordRef.current.classList.remove('element-show');
			clickedWordRef.current.classList.add('element-hide');
		}
	}

	function getMyWords() {
		var tmpCustom = WordsInterface.getCustom();
		var liked = tmpCustom.filter(item => item.learn).sort((a, b) => a.word < b.word ? -1 : 1);
		return liked;
	}

	const setCustomData = custom => {
		var user_custom = JSON.parse(custom);
		WordsInterface.initializeCustom(user_custom);
		setCustom(getMyWords());
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

	const exportCustom = () => {
		try {
			// Export only user-created custom words (marked with myown: true)
			const customWords = (WordsInterface.getCustom() || []).filter(w => w.myown === true);
			if (!customWords.length) {
				setMessage('No custom words to export.');
				return;
			}
			const dataStr = JSON.stringify(customWords, null, 2);
			const blob = new Blob([dataStr], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
			const filename = `wordmage-custom-${date}.json`;
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
			setMessage(`Exported ${customWords.length} custom words.`);
		} catch (err) {
			console.error('exportCustom error', err);
			setMessage('Failed to export custom words.');
		}
	}

	const login = async () => {
		console.log('login', email, password);
		var options = {
			method: 'POST',
			headers: { 'Content-type': 'application/json' },
			body: JSON.stringify({ email, password })
		};
		var response = await fetch(`${CONFIG.domain}/login`, options);
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

	const handleWordClick = e => {
		var el = e.target;
		var { word, def } = el.dataset;
		setClickedWord(word);
		setClickedDef(def);
		clickedWordRef.current.classList.remove('element-hide');
		clickedWordRef.current.classList.add('element-show');
		console.log('handleWordClick', word, def);
	}

	return (
		<div ref={profileFormRef} className="profile-form plain-content container">
			<div ref={clickedWordRef} className="clicked-word-container element-hide">
				<div className="clicked-word-item">
					<div className="clicked-word">{clickedWord}</div>
					<div className="clicked-def">{clickedDef}</div>
				</div>
			</div>
			<h3>Profile</h3>
			{message === '' ? null : <div className="profile-form-message">{message}</div>}

			{!profileUser.user_id ? (
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
					<div className="button-wrapper">
						<button className={'google-signin-btn'} onClick={() => { window.location.href = '/.netlify/functions/auth-google'; }}>
							<img src="/icons/google.svg" alt="" style={{ height: '18px', marginRight: '8px' }} /> Sign in with Google
						</button>
					</div>
					<div className="link-wrapper"><a href="/register">Not registered?</a></div>
				</div>
			) : (
				<div className="form">
					<div>Logged in as {profileUser.email}</div>
					<div className="button-wrapper">
						<button className={'logout-btn'} onClick={logout}>Log out</button>
						<button className={'export-btn'} onClick={exportCustom}>Export Custom</button>
					</div>

					<div className="my-profile-content">
						<h4>Words You're Learning</h4>
						{custom.length > 0 ? (
							<div className="my-words">
								{custom.map((item, ndx) => {
									return <div key={ndx} onClick={handleWordClick} data-word={item.word} data-def={item.def} className="my-word">{item.word}</div>
								})}
							</div>
						) : <div>Nothing yet...</div>}
					</div>

				</div>
			)}
		</div>
	);
}

export default Profile;
