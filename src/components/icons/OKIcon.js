import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const OKIcon = props => {
	return <button onClick={props.onClick} className={`btn btn-${props.type} btn-md`}>
          <FontAwesomeIcon icon={faCheck} />
        </button>
}

export default OKIcon;

