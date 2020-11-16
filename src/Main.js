import { useState } from 'react';
import WordList from './components/WordList';
import Spotlight from './components/Spotlight';
import ActiveList from './components/ActiveList';
import ArchiveList from './components/ArchiveList';
import WordsInterface from './utils/words-interface';

const wordHash = WordsInterface.fullWordList();
const wordList = Object.keys(wordHash);
const archiveList = WordsInterface.archiveWordList();

function Main(props) {
	const [item, setItem] = useState(WordsInterface.getWordObj('scytale'));
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
		var newActiveList = WordsInterface.toggleActive(word);
		setActiveList(Object.keys(newActiveList));
	}

	const updateWordList = () => {
		setFullWordList(WordsInterface.fullWordList());
	}

	return (
	<div className="container">
	  <div className={'rehearse' + (props.view !== 'rehearse' ? ' hide-section' : '')}>
	    <Spotlight item={item} moveToArchive={moveToArchive} />
	    <ActiveList activeList={activeList} selectActive={selectActive} />
	  </div>

	  <div className={'word-list-container' + (props.view !== 'word-list-container' ? ' hide-section' : '')}>
	    <WordList addWordState={props.addWordState} cancelAddWord={props.cancelAddWord} fullWordList={fullWordList} toggleActive={toggleActive} updateWordList={updateWordList} />
	  </div>

	  <div className={'archive-container' + (props.view !== 'archive-container' ? ' hide-section' : '')}>
	    <ArchiveList addWordState={props.addWordState} cancelAddWord={props.cancelAddWord} archiveWordList={archiveWordList} toggleActive={toggleActive} updateWordList={updateWordList} />
	  </div>

	</div>
	);
};

export default Main;
