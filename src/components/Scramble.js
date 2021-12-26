import { useEffect, useState } from 'react';
import { scramble } from '../utils/spotlight';
import RefreshIcon from './icons/RefreshIcon';

function initLetters(scrambled) {
	var letterStates = [];
	var letters = scrambled.split('');
	letters.forEach(l => {
		letterStates.push({[l]: false });
	});
	return letterStates;
}

function Scramble(props) {
	const [ scrambled, setScrambled ] = useState(scramble(props.word));
	const [ letterStates, setLetterStates ] = useState(initLetters(scrambled));
	const [ unscrambled, setUnscrambled ] = useState('');
	const [ finished, setFinished ] = useState(false);
	const [ showWord, setShowWord ] = useState(false);

	useEffect(() => {
		let newScrambled = scramble(props.word);
		setScrambled(newScrambled);
		setLetterStates(initLetters(newScrambled));
		setUnscrambled('');
		setFinished(false);
	}, [props.word]);

	const selectLetter = e => {
		var el = e.target;
		var letter = el.textContent;
		var ndx = el.dataset.ndx;
		var letterStatesClone = Object.assign({}, letterStates);
		if (letterStatesClone[ndx][letter]) {
			letterStatesClone[ndx][letter] = !letterStatesClone[ndx][letter];
			setLetterStates(letterStatesClone);
			let letterNdx = unscrambled.lastIndexOf(letter);
			setUnscrambled(unscrambled.substr(0, letterNdx) + unscrambled.substr(letterNdx+1));
		} else {
			letterStatesClone[ndx][letter] = !letterStatesClone[ndx][letter];
			setLetterStates(letterStatesClone);
			setUnscrambled(unscrambled + letter);
			if (unscrambled + letter === props.word) {
				setFinished(true);
				setShowWord(false);
			}
		}
	};

	const handleRefresh = e => {
		setLetterStates(initLetters(props.word));
		setFinished(false);
		setUnscrambled('');
		setScrambled(scramble(props.word));
	};

	const handleHint = e => {
		var ndx = unscrambled.length;
		var nextLetter = props.word[ndx];
		var position = scrambled.split('').indexOf(nextLetter);
		var els = Array.from(document.querySelectorAll('.letter'));
		els.forEach(el => {
			if (el.dataset.ndx == position) {
console.log('found', el);
				el.classList.add('hinted');
			}
});
	}

	const handleShowWord = e => {
		setShowWord(true);
	}

	return (
	<div className="scrambled-wrapper">

          <div className="word-scramble-buttons">
	    <button className={'badge badge-scramble' + (props.finished ? ' hide-section' : '')} onClick={handleRefresh}><i className="glyphicon glyphicon-repeat"></i> Reset</button>
            <div className="scramble-hint">
	      <button className={'badge badge-scramble' + (props.finished ? ' hide-section' : '')} onClick={handleHint}><i className="glyphicon glyphicon-question-sign"></i> Hint</button>
	      <button className={'badge badge-scramble' + (props.finished ? ' hide-section' : '')} onClick={handleShowWord}><i className="glyphicon glyphicon-info-sign"></i> Show Word</button>
            </div>
          </div>

          {showWord ? (<div className="show-word">
            {props.word.split('').map((letter, key) => <span key={key}>{letter}</span>)}
          </div>) : null}

	  <div className={'scrambled' + (finished ? ' finished' : '')}>
	    { scrambled.split('').map((letter, key) => {
	      var className = 'letter';
	      if (letterStates[key][letter]) { className += ' selected'; }
	      return <span key={key} onClick={selectLetter} data-ndx={key} className={className}>{letter}</span>;
	    })}
	  </div>
	  <div className={'unscrambled'}>
            {unscrambled.split('').map((letter, key) => <span key={key}>{letter}</span>)}
	  </div>
	</div>
	);

}

export default Scramble;
