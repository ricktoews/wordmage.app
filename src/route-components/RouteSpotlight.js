import Spotlight from '../components/Spotlight';
import ActiveList from '../components/ActiveList';

function RouteSpotlight() {

	return (
	  <div className="rehearse">
	    <Spotlight
	      popupWordForm={word => { props.popupWordForm(word) }}
	      popupMnemonicForm={word => { props.popupMnemonicForm(word) }}
	      item={item}
	      moveToArchive={word => { moveToArchive(word) }} />
	    <ActiveList
	      activeList={activeList}
	      selectActive={selectActive} />
	  </div>
	);
}
