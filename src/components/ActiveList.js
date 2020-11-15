import ActiveItem from './ActiveItem';

function ActiveList(props) {
	const activeList = Object.keys(props.activeList);

	const selectActive = word => {
		console.log('selectActive', word);
		props.selectActive(word);
	}

	return (
    <div className="focus-list">
	  <ul>
        { props.activeList.map((word, key) => <ActiveItem key={key} word={word} selectActive={selectActive} />)}
	  </ul>
    </div>
	);
}

export default ActiveList;
