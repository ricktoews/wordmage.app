function ActiveItem(props) {
	
	const selectActiveHandler = e => {
		console.log('selectActiveHandler', props.word);
		props.selectActive(props.word);
	};

	return (
	<li onClick={selectActiveHandler}>{props.word}</li>
	);
}

export default ActiveItem;
