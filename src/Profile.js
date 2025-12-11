import { useEffect, useRef, useState, useContext } from 'react';
import WordsInterface from './utils/words-interface';
import { CONFIG } from './config';
import { WordMageContext } from './WordMageContext';

function Profile(props) {
	var profile_user_id = localStorage.getItem('wordmage-profile-user_id');
	var profile_email = localStorage.getItem('wordmage-profile-email');
	// Fallback: if profile email not set (client-side GSI flow stores authUser),
	// attempt to read it from the `authUser` object persisted by client sign-in.
	if ((!profile_email || profile_email === 'null') && localStorage.getItem('authUser')) {
		try {
			const au = JSON.parse(localStorage.getItem('authUser'));
			if (au && au.email) profile_email = au.email;
			if (!profile_user_id && (au && (au.id || au.sub))) profile_user_id = au.id || au.sub;
		} catch (e) {
			// ignore parse errors
		}
	}
	var profileObj = { user_id: profile_user_id, email: profile_email };
	const { authUser } = useContext(WordMageContext) || {};
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConf, setPasswordConf] = useState('');
	const [message, setMessage] = useState('');
	const [showNotification, setShowNotification] = useState(false);
	const [profileUser, setProfileUser] = useState(profileObj);
	const [custom, setCustom] = useState(getMyWords());
	const [clickedWord, setClickedWord] = useState('');
	const [clickedDef, setClickedDef] = useState('');
	const [selectedDownload, setSelectedDownload] = useState('');

	const emailRef = useRef(null);
	const passwordRef = useRef(null);
	const clickedWordRef = useRef(null);
	const profileFormRef = useRef(null);

	// authUser is provided via WordMageContext; no local authUser state needed here.

	useEffect(() => {
		if (emailRef.current) {
			emailRef.current.focus();
		}
	}, []);

	// If redirected back from Google, the callback includes a base64 payload


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
			setShowNotification(true);
		} catch (err) {
			console.error('exportCustom error', err);
			setMessage('Failed to export custom words.');
			setShowNotification(true);
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

	const closeNotification = () => {
		setShowNotification(false);
		setMessage('');
	}

	const handleDownload = () => {
		try {
			let wordsToExport = [];
			const allCustom = WordsInterface.getCustom() || [];

			if (selectedDownload === 'favorites') {
				wordsToExport = allCustom.filter(w => w.spotlight);
			} else if (selectedDownload === 'learn') {
				wordsToExport = allCustom.filter(w => w.learn);
			} else if (selectedDownload === 'custom') {
				wordsToExport = allCustom.filter(w => w.myown === true);
			}

			if (!wordsToExport.length) {
				setMessage('No words selected to download.');
				setShowNotification(true);
				return;
			}

			const dataStr = JSON.stringify(wordsToExport, null, 2);
			const blob = new Blob([dataStr], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
			const filename = `wordmage-download-${date}.json`;
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
			setMessage(`Downloaded ${wordsToExport.length} words.`);
			setShowNotification(true);
		} catch (err) {
			console.error('handleDownload error', err);
			setMessage('Failed to download words.');
			setShowNotification(true);
		}
	}

	return (
		<>
			{showNotification && (
				<div className="notification-panel">
					<div className="notification-content">{message}</div>
					<button className="notification-close" onClick={closeNotification}>
						<i className="glyphicon glyphicon-remove"></i>
					</button>
				</div>
			)}
			<div className="profile-toolbar">
				<div className="page-title">Profile</div>
				{profileUser.user_id && (
					<button className="badge" onClick={exportCustom} title="Export custom words">
						<i className="glyphicon glyphicon-export"></i>
					</button>
				)}
			</div>
			<div ref={profileFormRef} className="profile-form plain-content container">
				<div ref={clickedWordRef} className="clicked-word-container element-hide">
					<div className="clicked-word-item">
						<div className="clicked-word">{clickedWord}</div>
						<div className="clicked-def">{clickedDef}</div>
					</div>
				</div>

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
						{/* Google sign-in removed from Profile page; use /login page instead */}
					</div>
					<div className="link-wrapper"><a href="/register">Not registered?</a></div>
				</div>
			) : (
				<div className="form">
					<div className="logged-in-message">Logged in as {profileUser.email || (authUser && authUser.email) || ''}</div>

					<div className="downloads-section">
						<h4 className="downloads-heading">Downloads</h4>
						<div className="download-options">
							<label className="download-checkbox-label" onClick={() => setSelectedDownload('favorites')}>
								<span className={`custom-checkbox ${selectedDownload === 'favorites' ? 'checked' : ''}`}></span>
								<span className="checkbox-text">Favorites</span>
							</label>
							<label className="download-checkbox-label" onClick={() => setSelectedDownload('learn')}>
								<span className={`custom-checkbox ${selectedDownload === 'learn' ? 'checked' : ''}`}></span>
								<span className="checkbox-text">Learn</span>
							</label>
							<label className="download-checkbox-label" onClick={() => setSelectedDownload('custom')}>
								<span className={`custom-checkbox ${selectedDownload === 'custom' ? 'checked' : ''}`}></span>
								<span className="checkbox-text">Custom</span>
							</label>
						</div>
						<button className="download-btn" onClick={handleDownload}>Download</button>
					</div>
				</div>
			)}
			</div>
		</>
	);
}

export default Profile;
