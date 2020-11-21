const AddIcon = props => {
	return <button onClick={props.onClick} className={ props.className }>
          <span className="glyphicon glyphicon-plus"></span>
        </button>
}

export default AddIcon;

