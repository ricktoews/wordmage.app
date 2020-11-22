import { useState } from 'react';
import WordsInterface from '../utils/words-interface';
import OKIcon from './OKIcon';
import CancelIcon from './CancelIcon';

function MnemonicForm(props) {
	const [ mnemonic, setMnemonic ] = useState(WordsInterface.getNotes(props.word));

	const handleChange = e => {
		var el = e.target;
		setMnemonic(el.value);
	};

	const cancel = () => {
		console.log('cancel');
		props.cancel();
	}

	const save = () => {
		console.log('save', props.word, mnemonic);
		WordsInterface.saveNotes(props.word, mnemonic);
		props.cancel();
	}

	return (
	  <div className="word-form-container">
	  <div className="word-form-wrapper">
	    <div className="word-form">
	      <h2 className="word">
	        To help you remember...
	      </h2>
	      <div className="notes">
	        <textarea placeholder="Definition" onChange={handleChange} rows="5">{mnemonic}</textarea>
	      </div>
	      <div className="button-wrapper">
	        <CancelIcon type="danger" onClick={cancel} />
	        <OKIcon type="info" onClick={save} />
	      </div>
	    </div>
	  </div>
	  </div>
	);
}

export default MnemonicForm;


