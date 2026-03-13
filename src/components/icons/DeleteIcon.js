import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const DeleteIcon = props => {
	return <button onClick={props.onClick} className="badge badge-circle badge-delete">
          <FontAwesomeIcon icon={faTrash} />
        </button>
}

export default DeleteIcon;

