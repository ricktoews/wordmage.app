import { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import WordList from './components/WordList';
import Spotlight from './components/Spotlight';
import ActiveList from './components/ActiveList';
import ArchiveList from './components/ArchiveList';
import WordsInterface from './utils/words-interface';
//import RouteSpotlight from './route-components/RouteSpotlight';

const wordHash = WordsInterface.fullWordList();
const wordList = Object.keys(wordHash);
const archiveList = WordsInterface.archiveWordList();

function Main(props) {
	const [item, setItem] = useState(WordsInterface.getSpotlightItem());
	const [activeList, setActiveList] = useState(WordsInterface.getActiveList());
	const [fullWordList, setFullWordList] = useState(wordHash);
	const [archiveWordList, setArchiveWordList] = useState(archiveList);

	const selectActive = word => {
		var item = WordsInterface.getWordObj(word); // wordList.find(wordItem => Object.keys(wordItem)[0] === word);
		setItem(item);
		
	};

	const toggleActive = word => {
		var newActiveList = WordsInterface.toggleActive(word);
		setActiveList(Object.keys(newActiveList));
	}

	const moveToArchive = word => {
		WordsInterface.archiveWord(word);
		var newActiveList = WordsInterface.getActiveList();
		setActiveList(newActiveList);
	}

	const updateWordList = () => {
		setFullWordList(WordsInterface.fullWordList());
	}

	return (
	<div className="app-container">
	  <Switch>
	    <Route exact path={["/", "/spotlight"]} render={() => { return (
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
	    ); } } />

	    <Route path="/word-list" render={() => { return (
	  <div className="word-list-container">
	    <WordList 
	      popupConfirm={word => { props.popupConfirm(word) } }
	      popupWordForm={word => { props.popupWordForm(word) } }
	      addWordState={props.addWordState}
	      cancelAddWord={props.cancelAddWord}
	      fullWordList={fullWordList}
	      toggleActive={toggleActive}
	      updateWordList={updateWordList} />
	  </div>
	    ); } } />

	    <Route path="/archive" render={() => { return (
	  <div className="archive-container">
	    <ArchiveList
	      popupWordForm={props.popupWordForm}
	      addWordState={props.addWordState}
	      cancelAddWord={props.cancelAddWord}
	      archiveWordList={archiveWordList}
	      toggleActive={toggleActive}
	      updateWordList={updateWordList} />
	  </div>
	    ); } } />
	  </Switch>
	</div>
	);
};

export default Main;
