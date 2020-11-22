const CancelIcon = props => {
	return <button onClick={props.onClick} className={`btn btn-${props.type} btn-md`}>
          <span className="glyphicon glyphicon-remove"></span>
        </button>
}

export default CancelIcon;

