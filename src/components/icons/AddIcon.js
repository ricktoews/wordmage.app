const AddIcon = props => {
  return <div className="add-button-container"><button className={'badge badge-add'} onClick={props.onClick}><i className="glyphicon glyphicon-plus"></i> Add Word</button></div>
}

export default AddIcon;

