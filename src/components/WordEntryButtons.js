import WordsInterface from '../utils/words-interface';

const likeOffClass = 'badge-like-filter-off';
const likeOnClass = 'badge-like-filter-on';
const dislikeOffClass = 'badge-dislike-filter-off';
const dislikeOnClass = 'badge-dislike-filter-on';
const learnOffClass = 'badge-learn-filter-off';
const learnOnClass = 'badge-learn-filter-on';
const taggedOnClass = 'badge-tag-filter-on';
const taggedOffClass = 'badge-tag-filter-off';

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
	var {liked, word} = data;
	toggleClass(el, [likeOnClass, likeOffClass]);
	WordsInterface.toggleSpotlight(word);
}

function learnHandler(e) {
	var el = e.target;
	if (!el.dataset.word) {
		el = el.parentNode;
	}
	var data = el.dataset;
	var {learn, word} = data;
	toggleClass(el, [learnOnClass, learnOffClass]);
	WordsInterface.toggleLearn(word);
}

function thumbsDownHandler(e) {
	var el = e.target;
	if (!el.dataset.word) {
		el = el.parentNode;
	}
	var data = el.dataset;
	var {disliked, word} = data;
	toggleClass(el, [dislikeOnClass, dislikeOffClass]);
	WordsInterface.toggleDislike(word);
}

function WordEntryButtons(props) {
	const { wordObj, listType, popupTags } = props;
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
	
	switch (listType) {
		case 'liked':
			buttons = (<div className="word-item-buttons">
                <button className={'badge ' + learnClass} data-liked={wordObj.learn} data-word={wordObj.word} onClick={learnHandler}><i className="glyphicon glyphicon-leaf"></i> &nbsp;Learn</button>
                <button className={'badge ' + likeOnClass} data-liked={wordObj.spotlight} data-word={wordObj.word} onClick={thumbsUpHandler}><i className="glyphicon glyphicon-thumbs-up"></i> &nbsp;Like</button>
                <button className={'badge ' + tagClass} data-tagged={wordObj.tagged} data-word={wordObj.word} onClick={tagPopupHandler}><i className="glyphicon glyphicon-tag"></i> &nbsp;Tag</button>
              </div>);
			break;
		case 'learn':
			buttons = (<div className="word-item-buttons">
                <button className={'badge ' + learnClass} data-liked={wordObj.learn} data-word={wordObj.word} onClick={learnHandler}><i className="glyphicon glyphicon-leaf"></i> &nbsp;Learn</button>
                <button className={'badge ' + likeClass} data-liked={wordObj.spotlight} data-word={wordObj.word} onClick={thumbsUpHandler}><i className="glyphicon glyphicon-thumbs-up"></i> &nbsp;Like</button>
                <button className={'badge ' + dislikeClass} data-disliked={wordObj.dislike} data-word={wordObj.word} onClick={thumbsDownHandler}><i className="glyphicon glyphicon-thumbs-down"></i> &nbsp;Meh</button>
                <button className={'badge ' + tagClass} data-tagged={wordObj.tagged} data-word={wordObj.word} onClick={tagPopupHandler}><i className="glyphicon glyphicon-tag"></i> &nbsp;Tag</button>
              </div>);
			break;
		default:
			buttons = (<div className="word-item-buttons">
                <button className={'badge ' + learnClass} data-liked={wordObj.learn} data-word={wordObj.word} onClick={learnHandler}><i className="glyphicon glyphicon-leaf"></i> &nbsp;Learn</button>
                <button className={'badge ' + likeClass} data-liked={wordObj.spotlight} data-word={wordObj.word} onClick={thumbsUpHandler}><i className="glyphicon glyphicon-thumbs-up"></i> &nbsp;Like</button>
                <button className={'badge ' + dislikeClass} data-disliked={wordObj.dislike} data-word={wordObj.word} onClick={thumbsDownHandler}><i className="glyphicon glyphicon-thumbs-down"></i> &nbsp;Meh</button>
                <button className={'badge ' + tagClass} data-tagged={wordObj.tagged} data-word={wordObj.word} onClick={tagPopupHandler}><i className="glyphicon glyphicon-tag"></i> &nbsp;Tag</button>
              </div>);
	}
		
	return buttons;
}

export default WordEntryButtons;
