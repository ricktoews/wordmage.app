import ReactDOM from 'react-dom';
import { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import WordItem from './WordItem';
import LetterItem from './LetterItem';
import AddWord from './AddWord';
import WordsInterface from '../utils/words-interface';

import luciferous from '../data/luciferous.json';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function WordList(props) {
	const [editWordState, setEditWordState] = useState(false);
	const [editWordItem, setEditWordItem] = useState({});
	const [wordList, setWordList] = useState( Object.keys( WordsInterface.getWordList(props.match.params.listtype)).sort() );
	const [lastLetterEl, setLastLetterEl] = useState(null);
	const [ letterOpen, setLetterOpen ] = useState({});

	useEffect(() => {
		setWordList(Object.keys( WordsInterface.getWordList(props.match.params.listtype)).sort() );
	}, [props.match.params.listtype]);

	const chooseLetter = e => {
		var el = e.target;
		var letter = el.dataset.letter;
		if (!letterOpen[letter]) {
			var re = new RegExp('^' + letter + '.*', 'i');
			var words = luciferous.filter(item => { return re.test(item.word); });
			setWordList(words.map(item => item.word));
			if (lastLetterEl) {
				ReactDOM.render(null, lastLetterEl.nextSibling);
			}
			ReactDOM.render(( <ul className="word-list">
				{ words.map((item, key) => <WordItem key={key} word={item.word} toggleActive={toggleActive} popupConfirm={word => { props.popupConfirm(word) }} popupWordForm={word => { props.popupWordForm(word) }} />)}
			</ul>), el.nextSibling);
			setLastLetterEl(el);
			letterOpen[letter] = true;
		} else {
			ReactDOM.render(null, lastLetterEl.nextSibling);
			letterOpen[letter] = false;
		}
		setLetterOpen(letterOpen);
		
	};

	const toggleActive = word => {
		props.toggleActive(word);
	}

	const updateWordList = () => {
		props.updateWordList();
	}

	return (
	<div className="word-list-container">
	  <div className="word-list-wrapper">
	    { !props.match.params.listtype ? (
	    <ul className="alphabet">
	      { alphabet.map((letter, key) => (<li key={key}>
	          <div data-letter={letter} onClick={chooseLetter}>{letter}</div>
	          <div className={'word-list ' + letter}> </div>
	        </li>) ) }
	    </ul>
	      ) : 

	      (
	    <ul className="word-list">
              { wordList.map((word, key) => <WordItem key={key} word={word} toggleActive={toggleActive} popupConfirm={word => { props.popupConfirm(word) }} popupWordForm={word => { props.popupWordForm(word) }} />)}
	    </ul>
	      )
	    }
	  </div>
	</div>
	);
}

export default withRouter(WordList);

