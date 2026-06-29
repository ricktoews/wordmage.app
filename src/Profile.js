import { useEffect, useRef, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import WordsInterface from './utils/words-interface';
import { CONFIG } from './config';
import { WordMageContext } from './WordMageContext';
import { clearAuthenticatedToken, persistTokenFromResponse } from './utils/auth';
import { loadUserWorkspace } from './utils/workspace';

const ALBUM_THEMES = ['classic', 'paper', 'ink', 'arcane', 'eldritch', 'obsidian', 'fogbound'];
const ALBUM_THEME_LABELS = {
	classic: 'Literary',
	paper: 'Parchment',
	ink: 'Nocturne',
	arcane: 'Arcane',
	eldritch: 'Eldritch',
	obsidian: 'Obsidian',
	fogbound: 'Fogbound',
};

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
	const loggedInEmail = profileUser.email || (authUser && authUser.email) || '';
	const [custom, setCustom] = useState(getMyWords());
	const [selectedDownload, setSelectedDownload] = useState('');
	const [selectedAlbumTheme, setSelectedAlbumTheme] = useState(() => {
		const savedTheme = localStorage.getItem('wordmage.albumTheme');
		return ALBUM_THEMES.includes(savedTheme) ? savedTheme : 'classic';
	});

	const emailRef = useRef(null);
	const passwordRef = useRef(null);

	// authUser is provided via WordMageContext; no local authUser state needed here.

	useEffect(() => {
		if (emailRef.current) {
			emailRef.current.focus();
		}
	}, []);

	// If redirected back from Google, the callback includes a base64 payload


	useEffect(() => {
		const handleThemeChanged = (event) => {
			const nextTheme = event?.detail?.theme;
			if (ALBUM_THEMES.includes(nextTheme)) {
				setSelectedAlbumTheme(nextTheme);
			}
		};

		const handleStorage = (event) => {
			if (event.key === 'wordmage.albumTheme') {
				const savedTheme = localStorage.getItem('wordmage.albumTheme');
				setSelectedAlbumTheme(ALBUM_THEMES.includes(savedTheme) ? savedTheme : 'classic');
			}
		};

		window.addEventListener('wordmage:albumThemeChanged', handleThemeChanged);
		window.addEventListener('storage', handleStorage);

		return () => {
			window.removeEventListener('wordmage:albumThemeChanged', handleThemeChanged);
			window.removeEventListener('storage', handleStorage);
		};
	}, []);

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
		localStorage.setItem('wordmage.hasAuthenticatedBefore', 'true');
		localStorage.removeItem('authUser');
		localStorage.removeItem('wordmage-profile-email');
		const anonymousUserId = localStorage.getItem('wordmage-anonymous-user_id');
		if (anonymousUserId) {
			localStorage.setItem('wordmage-profile-user_id', anonymousUserId);
		} else {
			localStorage.removeItem('wordmage-profile-user_id');
		}
		clearAuthenticatedToken();
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
			// Auto-hide notification after 3 seconds
			setTimeout(() => {
				setShowNotification(false);
				setMessage('');
			}, 3000);
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
		persistTokenFromResponse(data);
		var user_id = data.user_id;
		if (user_id == -1) {
			setMessage("The email / password combo you used isn't registered. Try again?");
		}
		else {
			setProfileUser({ user_id, email });
			localStorage.setItem('wordmage-profile-user_id', user_id);
			localStorage.setItem('wordmage-profile-email', email);
			localStorage.setItem('wordmage.hasAuthenticatedBefore', 'true');
			await loadUserWorkspace(user_id);
			window.dispatchEvent(new CustomEvent('wordmage:workspaceChanged', {
				detail: { userId: String(user_id) }
			}));
		}
		if (data.custom) {
			setCustomData(data.custom);
		}
	}

	const closeNotification = () => {
		setShowNotification(false);
		setMessage('');
	}

	const handleDownload = (type) => {
		try {
			let wordsToExport = [];
			const userData = WordsInterface.getUserData();

			if (type === 'favorites') {
				wordsToExport = userData.liked || [];
			} else if (type === 'learn') {
				wordsToExport = userData.learn || [];
			} else if (type === 'custom') {
				const allCustom = WordsInterface.getCustom() || [];
				wordsToExport = allCustom.filter(w => w.myown === true);
			}

			if (!wordsToExport.length) {
				setMessage('No words available to download.');
				setShowNotification(true);
				return;
			}

			const dataStr = JSON.stringify(wordsToExport, null, 2);
			const blob = new Blob([dataStr], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
			const filename = `wordmage-${type}-${date}.json`;
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
			setMessage(`Downloaded ${wordsToExport.length} words.`);
			setShowNotification(true);
			// Auto-hide notification after 3 seconds
			setTimeout(() => {
				setShowNotification(false);
				setMessage('');
			}, 3000);
		} catch (err) {
			console.error('handleDownload error', err);
			setMessage('Failed to download words.');
			setShowNotification(true);
		}
	}

	const handleThemeSelect = (themeName) => {
		if (!ALBUM_THEMES.includes(themeName)) {
			return;
		}

		localStorage.setItem('wordmage.albumTheme', themeName);
		setSelectedAlbumTheme(themeName);
		window.dispatchEvent(new CustomEvent('wordmage:albumThemeChanged', {
			detail: { theme: themeName }
		}));
	};

	return (
		<>
			{showNotification && (
				<div className="notification-panel">
					<div className="notification-content">{message}</div>
					<button className="notification-close" onClick={closeNotification}>
						<FontAwesomeIcon icon={faXmark} />
					</button>
				</div>
			)}
			<div className="profile-toolbar">
				<div className="page-title">Settings</div>
				{loggedInEmail && (
					<div className="logged-in-message">Logged in as {loggedInEmail}</div>
				)}
			</div>
			<div className="profile-form plain-content container">
				{!profileUser.user_id && (
					<div className="form">
						<div className="input-field">
							<div className="icon-wrapper"><FontAwesomeIcon icon={faEnvelope} /></div>
							<input placeholder="Email" ref={emailRef} type="text" id="email" className="email" onChange={handleChange} onFocus={handleFocus} />
						</div>
						<div className="input-field">
							<div className="icon-wrapper"><FontAwesomeIcon icon={faLock} /></div>
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
				)}

				<div className="downloads-section">
					<h4 className="downloads-heading">Theme</h4>
					<div className="theme-picker-options" role="radiogroup" aria-label="Theme selection">
						{ALBUM_THEMES.map((themeName) => (
							<button
								type="button"
								key={themeName}
								className={`theme-picker-btn ${selectedAlbumTheme === themeName ? 'active' : ''}`}
								onClick={() => handleThemeSelect(themeName)}
								role="radio"
								aria-checked={selectedAlbumTheme === themeName}
							>
								<span className={`theme-swatch theme-swatch-${themeName}`} aria-hidden="true" />
								<span className="theme-picker-label">{ALBUM_THEME_LABELS[themeName]}</span>
							</button>
						))}
					</div>
				</div>

				<div className="downloads-section">
					<h4 className="downloads-heading">Downloads</h4>
					<div className="download-options">
						<button
							className={`download-pill-btn ${selectedDownload === 'favorites' ? 'active' : ''}`}
							onClick={() => handleDownload('favorites')}
						>
							Favorites
						</button>
						<button
							className={`download-pill-btn ${selectedDownload === 'learn' ? 'active' : ''}`}
							onClick={() => handleDownload('learn')}
						>
							Learn
						</button>
						<button
							className={`download-pill-btn ${selectedDownload === 'custom' ? 'active' : ''}`}
							onClick={() => handleDownload('custom')}
						>
							Custom
						</button>
					</div>
				</div>

			</div>
		</>
	);
}

export default Profile;
