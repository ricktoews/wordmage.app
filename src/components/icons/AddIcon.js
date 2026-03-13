import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const AddIcon = props => {
  return <div className="add-button-container"><button className={'badge badge-add'} onClick={props.onClick}><FontAwesomeIcon icon={faPlus} /> Add Word</button></div>
}

export default AddIcon;

