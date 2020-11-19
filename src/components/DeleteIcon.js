const DeleteIcon = props => {
	return <button onClick={props.onClick} className="btn btn-danger btn-md">
          <span className="glyphicon glyphicon-trash"></span>
        </button>
}

export default DeleteIcon;

