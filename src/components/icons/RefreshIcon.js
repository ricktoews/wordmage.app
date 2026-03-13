import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate } from '@fortawesome/free-solid-svg-icons';

const RefreshIcon = props => {
	return <button className={'badge badge-refresh' + (props.finished ? ' hide-section' : '')} onClick={props.onClick}><FontAwesomeIcon icon={faRotate} /> Reset</button>
}

export default RefreshIcon;

