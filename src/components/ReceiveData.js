import { useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';
import { receive } from '../utils/api';

function ReceiveData(props) {
	const [ receiveCode, setReceiveCode ] = useState('');
	const [ msg, setMsg ] = useState('');
	const [ receivedData, setReceivedData ] = useState(null);

	const cancelReceive = () => {
		console.log('cancel');
		props.cancelReceive();
		// Just hide form; no need to update any components.
	}

	const handleReceive = e => {
		var el = e.target;
		var code = el.value;
		console.log('receive code', el.value);
		receive(code).then(res => {
			console.log('received res', res);
			if (res.msg) setMsg(res.msg);
			else if (res.custom || res.active || res.archived) setReceivedData(res);
			setReceiveCode(code);
		});
		// Finally, hide form. This should reach the top and hopefully cascade rerender components.
	}

	const replaceData = () => {
		console.log('data will be replaced.', receivedData);
		WordsInterface.replaceUserData(receivedData);
		props.cancelReceive();
	}

	return (
	<div className="word-form-container">
	  <div className="word-form-wrapper">
	    <div className="word-form">
	      { !receiveCode ? (
	      <h2 className="word">
	        Code: <input type="text" size="10" onBlur={handleReceive} />
	      </h2>
	        ) : (
	      <h2 className="word">
	        Received data from other device. This will overwrite any words data on this device. Continue?
	      </h2>
	        )
	      }
	      { !receiveCode ? (
	      <div className="button-wrapper">
	      </div>
	        ) : (
	      <div className="button-wrapper">
	        <button class="btn btn-cancel" onClick={cancelReceive}>Cancel</button>
	        <button class="btn btn-save" onClick={replaceData}>Continue</button>
	      </div>
	        )
	      }
	    </div>
	  </div>
	</div>
	);
}

export default withRouter(ReceiveData);




