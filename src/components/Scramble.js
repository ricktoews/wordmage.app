import { useEffect, useState } from 'react';
import { scramble } from '../utils/spotlight';
import RefreshIcon from './RefreshIcon';

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
			}
		}
	};

	const handleRefresh = e => {
		setLetterStates(initLetters(props.word));
		setUnscrambled('');
	};
console.log('unscrambled', unscrambled, scrambled);
	return (
	<div className="scrambled-wrapper">
	  <div className={'scrambled' + (finished ? ' finished' : '')}>
	    { scrambled.split('').map((letter, key) => {
	      var className = 'letter';
	      if (letterStates[key][letter]) { className += ' selected'; }
	      return <span key={key} onClick={selectLetter} data-ndx={key} className={className}>{letter}</span>;
	    })}
	  </div>
	  <div className={'unscrambled' + (finished ? ' hide-section' : '')}>
	    <RefreshIcon onClick={handleRefresh} finished={finished} /> {unscrambled.split('').map((letter, key) => <span key={key}>{letter}</span>)}
	  </div>
	</div>
	);

}

export default Scramble;
