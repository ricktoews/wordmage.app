import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';
import { share } from '../utils/api';
import QRCode from 'qrcode.react';

function ConfirmShare(props) {
	const [ shareCode, setShareCode ] = useState('');

	useEffect(() => {
		console.log('ConfirmShare; generate code.');
		share(WordsInterface.getUserData()).then(res => {
			console.log('share res', res);
			setShareCode(res.code);
		});
	}, []);

	const cancelShare = () => {
		console.log('cancel');
		props.cancelShare();
		// Just hide form; no need to update any components.
	}

	const shareWords = () => {
		console.log('share');
		// Need to save custom word, spotlight, or whatever.
		share(WordsInterface.getUserData()).then(res => {
			console.log('shareWords res', res);
			setShareCode(res.code);
		});
		// Finally, hide form. This should reach the top and hopefully cascade rerender components.
	}

	const ok = () => {
		console.log('share');
		props.cancelShare();
	}

	return (
	<div className="word-form-container">
	  <div className="word-form-wrapper">
	    <div className="word-form">
	      <div className="word">
            <div className="qrcode"><QRCode value={'https://wordmage.app/get/' + shareCode} /></div>
		    <div className="code">{shareCode}</div>
	      </div>
	    </div>
	  </div>
	</div>
	);
}

export default withRouter(ConfirmShare);



