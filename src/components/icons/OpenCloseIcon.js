import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';

const OpenCloseIcon = props => {
	return <button onClick={props.onClick} className={'btn btn-info btn-md ' + props.className}>
          <FontAwesomeIcon icon={faChevronUp} />
        </button>
};

export default OpenCloseIcon;
