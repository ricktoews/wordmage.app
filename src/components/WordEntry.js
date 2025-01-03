import WordsInterface from '../utils/words-interface';
import WordEntryButtons from './WordEntryButtons';
import { FacebookShareButton, FacebookIcon } from "react-share";
import { TwitterShareButton, XIcon } from "react-share";

function WordEntry(props) {
	const { history } = props;
	const { wordObj, listType } = props;

	function deleteWordToggle(wordObj, e) {
		var wordEl = e.target.parentNode.parentNode.querySelector('.word-item-word');
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
		var wordEl = e.target.parentNode.parentNode.querySelector('.word-item-word');
		var classes = Array.from(wordEl.classList);
		props.popupWordForm(wordObj._id);
	}

	function scrambleWord(wordObj) {
		console.log('scrambleWord', wordObj);
		history.push('/spotlight', { wordObj: wordObj });
	}

	function FacebookShare(wordObj) {
		return (
			<FacebookShareButton
				url={'https://wordmage.app/spotlight/' + wordObj.word}
				quote={`${wordObj.word.toUpperCase()}. ${wordObj.def}`}
				className={'share-btn'}>
				<FacebookIcon size={32} round={true} />
			</FacebookShareButton>
		);

	}

	function TwitterShare(wordObj) {
		return (
			<TwitterShareButton
				url={'https://wordmage.app/spotlight/' + wordObj.word}
				title={`${wordObj.word.toUpperCase()}. ${wordObj.def}`}
				hashtags={['wordmage']}
				className={'share-btn'}>
				<XIcon size={32} round={true} />
			</TwitterShareButton>
		);
	}

	return wordObj.divider ? <hr className="rejects" /> : (
		<div className="word-item">
			<div className="word-item-word-container">
				<div className="word-item-word">{wordObj.word}</div>
				<div className="scramble-btn" onClick={() => { scrambleWord(wordObj); }}><i className="glyphicon glyphicon-retweet"></i></div>
				{wordObj.myown ? <div className="trash-btn" onClick={e => { deleteWordToggle(wordObj, e); }}><i className="glyphicon glyphicon-trash"></i></div> : null}
				{wordObj.myown ? <div className="edit-btn" onClick={e => { editWord(wordObj, e); }}><i className="glyphicon glyphicon-pencil"></i></div> : null}
				{FacebookShare(wordObj)}
				{TwitterShare(wordObj)}
			</div>
			<div className="word-item-def-container">
				<div className="source-def-container">
					<div className="word-item-def">{wordObj.def}</div>
					<span className="word-item-source">(source: {wordObj.source})</span>
				</div>
				<WordEntryButtons wordObj={wordObj} listType={listType} popupTags={props.popupTags} />
			</div>
		</div>
	);
}

export default WordEntry;
