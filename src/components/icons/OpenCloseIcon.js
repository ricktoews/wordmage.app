const OpenCloseIcon = props => {
	return <button onClick={props.onClick} className={'btn btn-info btn-md ' + props.className}>
          <span className="glyphicon glyphicon-chevron-up"></span>
        </button>
};

export default OpenCloseIcon;
