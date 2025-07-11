import WordsInterface from '../utils/words-interface';

const likeOffClass = 'badge-like-filter-off';
const likeOnClass = 'badge-like-filter-on';
const dislikeOffClass = 'badge-dislike-filter-off';
const dislikeOnClass = 'badge-dislike-filter-on';
const learnOffClass = 'badge-learn-filter-off';
const learnOnClass = 'badge-learn-filter-on';
const taggedOnClass = 'badge-tag-filter-on';
const taggedOffClass = 'badge-tag-filter-off';
const shareClass = 'badge-like-filter-off';

const SHARE_ICON = false;

function toggleClass(el, toggleClasses) {
	let classes = Array.from(el.classList);
	if (classes.indexOf(toggleClasses[0]) !== -1) {
		el.classList.remove(toggleClasses[0])
		el.classList.add(toggleClasses[1])
	}
	else {
		el.classList.remove(toggleClasses[1])
		el.classList.add(toggleClasses[0])
	}
}

function thumbsUpHandler(e) {
	var el = e.target;
	if (!el.dataset.word) {
		el = el.parentNode;
	}
	var data = el.dataset;
	var { word } = data;
	const classes = Array.from(el.classList);
	const liked = classes.indexOf(likeOnClass) !== -1;
	if (!liked) {
		const thumbsDown = el.closest('.word-item-buttons').querySelector('.thumbs-down');
		thumbsDown.classList.remove(dislikeOnClass);
		thumbsDown.classList.add(dislikeOffClass);
	}
	toggleClass(el, [likeOnClass, likeOffClass]);
	WordsInterface.toggleSpotlight(word);
}

function thumbsDownHandler(e) {
	var el = e.target;
	if (!el.dataset.word) {
		el = el.parentNode;
	}
	var data = el.dataset;
	var { word } = data;
	const classes = Array.from(el.classList);
	const disliked = classes.indexOf(dislikeOnClass) !== -1;
	if (!disliked) {
		const thumbsDown = el.closest('.word-item-buttons').querySelector('.thumbs-up');
		thumbsDown.classList.remove(likeOnClass);
		thumbsDown.classList.add(likeOffClass);
	}
	toggleClass(el, [dislikeOnClass, dislikeOffClass]);
	WordsInterface.toggleDislike(word);
}

function learnHandler(e) {
	var el = e.target;
	if (!el.dataset.word) {
		el = el.parentNode;
	}
	var data = el.dataset;
	var { learn, word } = data;
	toggleClass(el, [learnOnClass, learnOffClass]);
	WordsInterface.toggleLearn(word);
}

function WordEntryButtons(props) {
	const { buttonGroup, wordObj, listType, popupTags, popupWordShare } = props;
	var buttons;
	var learnClass = wordObj.learn ? learnOnClass : learnOffClass;
	var likeClass = wordObj.spotlight ? likeOnClass : likeOffClass;
	var dislikeClass = wordObj.dislike ? dislikeOnClass : dislikeOffClass;
	var tagClass = wordObj.tags && wordObj.tags.length > 0 ? taggedOnClass : taggedOffClass;

	function tagPopupHandler(e) {
		var el = e.target;
		if (!el.dataset.word) {
			el = el.parentNode;
		}
		var data = el.dataset;
		popupTags(wordObj, el);
		// Popup tag list.
	}

	function wordShareHandler(e) {
		const el = e.target;
		popupWordShare(wordObj);
	}

	if (buttonGroup === 'left') {
		switch (listType) {
			case 'liked':
				buttons = (<div className="word-item-buttons">
					<button className={'thumbs-up badge ' + likeOnClass} data-liked={wordObj.spotlight} data-word={wordObj.word} onClick={thumbsUpHandler}><i className="glyphicon glyphicon-thumbs-up"></i></button>
					<button className={'thumbs-down badge ' + dislikeClass} data-disliked={wordObj.dislike} data-word={wordObj.word} onClick={thumbsDownHandler}><i className="glyphicon glyphicon-thumbs-down"></i></button>
				</div>);
				break;
			case 'learn':
				buttons = (<div className="word-item-buttons">
					<button className={'thumbs-up badge ' + likeClass} data-liked={wordObj.spotlight} data-word={wordObj.word} onClick={thumbsUpHandler}><i className="glyphicon glyphicon-thumbs-up"></i></button>
					<button className={'thumbs-down badge ' + dislikeClass} data-disliked={wordObj.dislike} data-word={wordObj.word} onClick={thumbsDownHandler}><i className="glyphicon glyphicon-thumbs-down"></i></button>
				</div>);
				break;
			default:
				buttons = (<div className="word-item-buttons">
					<button className={'thumbs-up badge ' + likeClass} data-liked={wordObj.spotlight} data-word={wordObj.word} onClick={thumbsUpHandler}><i className="glyphicon glyphicon-thumbs-up"></i></button>
					<button className={'thumbs-down badge ' + dislikeClass} data-disliked={wordObj.dislike} data-word={wordObj.word} onClick={thumbsDownHandler}><i className="glyphicon glyphicon-thumbs-down"></i></button>
					{SHARE_ICON && <button className={'share badge ' + shareClass} data-word={wordObj.word} onClick={wordShareHandler}><i className="glyphicon glyphicon-share"></i></button>}
				</div>);
		}
	}
	else {
		switch (listType) {
			case 'liked':
				buttons = (<div className="word-item-buttons">
					<button className={'badge ' + learnClass} data-liked={wordObj.learn} data-word={wordObj.word} onClick={learnHandler}><i className="glyphicon glyphicon-leaf"></i> &nbsp;Learn</button>
					<button className={'badge ' + tagClass} data-tagged={wordObj.tagged} data-word={wordObj.word} onClick={tagPopupHandler}><i className="glyphicon glyphicon-tag"></i> &nbsp;Tag</button>
				</div>);
				break;
			case 'learn':
				buttons = (<div className="word-item-buttons">
					<button className={'badge ' + learnClass} data-liked={wordObj.learn} data-word={wordObj.word} onClick={learnHandler}><i className="glyphicon glyphicon-leaf"></i> &nbsp;Learn</button>
					<button className={'badge ' + tagClass} data-tagged={wordObj.tagged} data-word={wordObj.word} onClick={tagPopupHandler}><i className="glyphicon glyphicon-tag"></i> &nbsp;Tag</button>
				</div>);
				break;
			default:
				buttons = (<div className="word-item-buttons">
					<button className={'badge ' + learnClass} data-liked={wordObj.learn} data-word={wordObj.word} onClick={learnHandler}><i className="glyphicon glyphicon-leaf"></i> &nbsp;Learn</button>
					<button className={'badge ' + tagClass} data-tagged={wordObj.tagged} data-word={wordObj.word} onClick={tagPopupHandler}><i className="glyphicon glyphicon-tag"></i> &nbsp;Tag</button>
				</div>);
		}
	}
	return buttons;
}

export default WordEntryButtons;
