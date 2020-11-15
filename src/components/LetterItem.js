function LetterItem(props) {
	const handleClick = () => {
		props.goToLetter(props.letter);
	}

	return <li onClick={handleClick}>{props.letter}</li>
}

export default LetterItem;
