import { useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';
import { share } from '../utils/api';

function ConfirmShare(props) {
	const [ shareCode, setShareCode ] = useState('');
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
	      { shareCode ? (
	      <h2 className="word">
	        Select Receive, and use this code on your other device: {shareCode}
	      </h2>
	        ) : (
	      <h2 className="word">
	        Share your words data with another device. Are you sure?
	      </h2>
	        )
	      }
	      { shareCode ? (
	      <div className="button-wrapper">
	        <button class="btn btn-save" onClick={ok}>OK</button>
	      </div>
	        ) : (
	      <div className="button-wrapper">
	        <button class="btn btn-cancel" onClick={cancelShare}>Cancel</button>
	        <button class="btn btn-save" onClick={shareWords}>Share</button>
	      </div>
	        )
	      }
	    </div>
	  </div>
	</div>
	);
}

export default withRouter(ConfirmShare);



