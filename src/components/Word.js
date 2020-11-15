import { useEffect, useState } from 'react';
import { itemToObj } from '../utils/helpers';

function Word(props) {
	const [ wordItem, setWordItem ] = useState(itemToObj(props.word));

	return (
	<div className="word-item">
		{wordItem.word}: {wordItem.def}
	</div>
	);
}

export default Word;
