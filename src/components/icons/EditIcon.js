import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil } from '@fortawesome/free-solid-svg-icons';

const EditIcon = props => {
	return <button onClick={props.onClick} className="badge badge-circle badge-edit">
          <FontAwesomeIcon icon={faPencil} />
        </button>
}

export default EditIcon;
