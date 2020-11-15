/*
	myWords: 
	{
		"custom": [custom words],
		"active": [word with notes],
		"archive": [word with notes]	
	}

	custom words:
	{ [word]: [definition] }

	word with notes:
	{ [word]: [notes] }

 */
import { useState } from 'react';
import WordList from './components/WordList';
import Spotlight from './components/Spotlight';
import ActiveList from './components/ActiveList';
import wordHash from './data/word-list.json';
import WordsInterface from './utils/words-interface';

const wordList = Object.keys(wordHash);
/*
const active = [
  'spurious', 'apophenia', 'specious', 'apophasis', 'vespertilionize', 'scytale'
];
*/

function Main(props) {
	const [item, setItem] = useState(WordsInterface.getWordObj('scytale'));
	const [activeList, setActiveList] = useState(WordsInterface.getActiveList());

	const selectActive = word => {
		var item = WordsInterface.getWordObj(word); // wordList.find(wordItem => Object.keys(wordItem)[0] === word);
		setItem(item);
		
	};

	const toggleActive = word => {
		var newActiveList = WordsInterface.toggleActive(word);
		setActiveList(Object.keys(newActiveList));
		
	}

	return (
	<div className="container">
	  <div className={'rehearse' + (props.view !== 'rehearse' ? ' hide-section' : '')}>
	    <Spotlight item={item} />
	    <ActiveList activeList={activeList} selectActive={selectActive} />
	  </div>

	  <div className={'word-list-container' + (props.view !== 'word-list-container' ? ' hide-section' : '')}>
	    <WordList toggleActive={toggleActive} />
	  </div>

	</div>
	);
};

export default Main;
