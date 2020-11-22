const OKIcon = props => {
	return <button onClick={props.onClick} className={`btn btn-${props.type} btn-md`}>
          <span className="glyphicon glyphicon-ok"></span>
        </button>
}

export default OKIcon;

