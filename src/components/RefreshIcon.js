const RefreshIcon = props => {
	return <button onClick={props.onClick} className={'btn btn-info btn-sm' + (props.finished ? ' hide-section' : '')}>
          <span className="glyphicon glyphicon-refresh"></span>
        </button>
}

export default RefreshIcon;

