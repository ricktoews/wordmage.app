const DeleteIcon = props => {
	return <button onClick={props.onClick} className="badge badge-circle badge-delete">
          <span className="glyphicon glyphicon-trash"></span>
        </button>
}

export default DeleteIcon;

