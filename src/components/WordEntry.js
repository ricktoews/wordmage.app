import { useState } from 'react';
import WordsInterface from '../utils/words-interface';
import WordEntryButtons from './WordEntryButtons';
import WordCardMenu from './WordCardMenu';
import { FacebookShareButton, FacebookIcon } from "react-share";
import { TwitterShareButton, XIcon } from "react-share";

function WordEntry(props) {
	const { history } = props;
	const { wordObj, listType } = props;
	const [updateToggle, setUpdateToggle] = useState(false);

	function deleteWordToggle(wordObj, e) {
		var wordEl = e.target.closest('.word-item-word-container').querySelector('.word-item-word');
		var classes = Array.from(wordEl.classList);
		if (classes.indexOf('deleted') === -1) {
			wordEl.classList.add('deleted');
			WordsInterface.deleteCustomWord(wordObj._id);
		}
		else {
			wordEl.classList.remove('deleted');
			WordsInterface.undeleteCustomWord(wordObj);
		}

	}

	function editWord(wordObj, e) {
		var wordEl = e.target.closest('.word-item-word-container').querySelector('.word-item-word');
		var classes = Array.from(wordEl.classList);
		props.popupWordForm(wordObj._id);
	}

	function scrambleWord(wordObj) {
		console.log('scrambleWord', wordObj);
		history.push('/spotlight', { wordObj: wordObj });
	}

	return wordObj.divider ? <hr className="rejects" /> : (
		<div className="word-item">
			<div className="word-item-word-container">
				<div className="word-edit-btn" style={{ display: 'flex' }}>
					{false && wordObj.myown ? <div className="trash-btn" onClick={e => { deleteWordToggle(wordObj, e); }}><i className="glyphicon glyphicon-trash"></i></div> : null}
					{wordObj.myown ? <button className="badge badge-edit" onClick={e => { editWord(wordObj, e); }}><i className="glyphicon glyphicon-pencil"></i></button> : null}
				</div>
				<div className="word-item-word">{wordObj.word}</div>
				<div style={{ display: 'none' }} className="scramble-btn" onClick={() => { scrambleWord(wordObj); }}><i className="glyphicon glyphicon-retweet"></i></div>
				<WordCardMenu 
					wordObj={wordObj} 
					listType={listType} 
					popupTags={props.popupTags}
					onUpdate={() => setUpdateToggle(!updateToggle)}
				/>
			</div>
		<div className="word-item-def-container">
			<div className="source-def-container">
				<div className="word-item-def">{wordObj.def}</div>
			</div>
		</div>
		</div>
	);
}

export default WordEntry;
