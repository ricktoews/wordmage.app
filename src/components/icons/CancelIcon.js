import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const CancelIcon = props => {
	return <button onClick={props.onClick} className={`btn btn-${props.type} btn-md`}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
}

export default CancelIcon;

