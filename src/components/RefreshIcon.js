const RefreshIcon = props => {
	/*
	return <button onClick={props.onClick} className={'btn btn-info btn-sm' + (props.finished ? ' hide-section' : '')}>
          <span className="glyphicon glyphicon-refresh"></span>
        </button>
		*/
	return <button className={'badge badge-refresh'} onClick={props.onClick}><i className="glyphicon glyphicon-repeat"></i> Reset</button>
}

export default RefreshIcon;

