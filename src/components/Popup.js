import { useEffect, useState } from 'react';
import WordForm from './WordForm';
import MnemonicForm from './MnemonicForm';
import ConfirmDelete from './ConfirmDelete';
import ConfirmShare from './ConfirmShare';
import ReceiveData from './ReceiveData';

function Popup(props) {
	const [ view, setView ] = useState(props.view);
	const [ data, setData ] = useState(props.data);
	const [ popupCode, setPopupCode ] = useState(<div />);
console.log('Popup component', props);

	useEffect(() => {
		setView(props.view);
		setData(props.data);
	}, [props.view]);

	switch (view) {
		case 'mnemonic': 
			setPopupCode(<MnemonicForm data={data} />);
		case 'add-word':
			setPopupCode(<WordForm data={data} />);
		case 'share':
			setPopupCode(<ConfirmShare data={data} />);
		case 'receive':
			setPopupCode(<ReceiveData data={data} />);
		default:
			setPopupCode(<div />);
	}

	return (
	<div className="word-form-container">
	  <div className="word-form-wrapper">
	<div className="popup">
	  <h1>Popup Content Here</h1>
	  {popupCode}
	</div>
	  </div>
	</div>
	);
}

export default Popup;
