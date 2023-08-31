import { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import DataSource from './utils/data-source';
import WordsInterface from './utils/words-interface';
import { CONFIG } from './config';

const userLocalData = DataSource.retrieveUserLocalData();

function Register(props) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConf, setPasswordConf] = useState('');
    const [profileUser, setProfileUser] = useState({});
    const [custom, setCustom] = useState();
    const [showMsg, setShowMsg] = useState(false);

    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    useEffect(() => {
        console.log('focus email field');
        emailRef.current.focus();
    }, []);

    const handleFocus = e => {
        setShowMsg(false);
    };

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

    const setCustomData = custom => {
        var user_custom = JSON.parse(custom);
        WordsInterface.initializeCustom(user_custom);
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
        console.log('login from Registration', data);
        var user_id = data.user_id;
        setProfileUser({ user_id, email });
        localStorage.setItem('wordmage-profile-user_id', user_id);
        localStorage.setItem('wordmage-profile-email', email);
        if (data.custom) {
            setCustomData(data.custom);
        }
        props.history.push('/profile');
    }

    const register = async () => {
        console.log('register', email, password, userLocalData);
        var payload = { email, password, userData: userLocalData };
        var options = {
            method: 'post',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(payload)
        };
        var response = await fetch(`${CONFIG.domain}/register`, options);
        var data = await response.json();
        console.log('register', data);
        if (data.status) {
            login();
        }
        else {
            setShowMsg(true);
            console.log('registration failed', data);
        }
    }

    return (
        <div className="profile-form plain-content container">
            <h3>Register</h3>
            <p>Why register? No need, unless you want to be able to view your word list choices (likes, words to learn, &c.) on another device. To do that, you need to be able to identify yourself. Which can't happen unless you're registered.</p>
            <div className="form">
                <div className="input-field">
                    <div className="icon-wrapper"><i className="glyphicon glyphicon-envelope"></i></div>
                    <input placeholder="Email" ref={emailRef} type="email" id="register-email" className="register-email" onChange={handleChange} onFocus={handleFocus} />
                </div>
                {showMsg ? (<div className="profile-form-message">
                    Email already registered.
                </div>) : null}
                <div className="input-field">
                    <div className="icon-wrapper"><i className="glyphicon glyphicon-lock"></i></div>
                    <input placeholder="Password" ref={passwordRef} type="text" id="register-password" className="register-password" onChange={handleChange} onFocus={handleFocus} />
                </div>
                <div className="button-wrapper">
                    <button className={'register-btn'} onClick={register}>Register</button>
                </div>
            </div>
        </div>
    );
}

export default withRouter(Register);
