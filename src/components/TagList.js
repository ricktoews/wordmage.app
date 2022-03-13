import { useEffect, useRef, useState } from 'react';

function Tag(props) {
	const checkBoxRef =useRef(null);

	useEffect(() => {
		var checked = false;
		if (Array.isArray(props.wordTags)) {
			checked = props.wordTags.indexOf(props.label) !== -1 ? true : false;
		}
		checkBoxRef.current.checked = checked;
	});

	function handleCheckboxClick(e) {
		var el = e.target;
		props.tagClick(el, props.label);
	}

	return (
	<div><input ref={checkBoxRef} type="checkbox" onClick={handleCheckboxClick} data-tag={props.label} /> {props.label}</div>
	);
}

function TagList(props) {
	const [tags, setTags] = useState(props.tagList);
	const [isAddTag, setIsAddTag] = useState(!!props.wordObj.word);
	const newTagRef = useRef(null);
	const tagListRef = useRef(null);

	// Meant to focus on New Tag field.
	useEffect(() => {
		if (newTagRef.current) {
			newTagRef.current.focus();
		}
		if (newTagRef.current) {
			newTagRef.current.value = '';
		}
	}, [props.showTags]);

	// Show tag list
	useEffect(() => {
		toggleTagPopup(props.showTags);
		setTags(props.tagList);
		setIsAddTag(!!props.wordObj.word);
	}, [props.showTags]);

	useEffect(() => {
		console.log('set tagList', tagListRef);
		props.tagListEl(tagListRef);
	}, []);

	function toggleTagPopup(showPopup) {
		console.log('toggleTagPopup', showPopup);
		if (tagListRef.current) {
			if (showPopup) {
				tagListRef.current.classList.remove('element-hide');
				tagListRef.current.classList.add('element-show');
			}
			else {
				tagListRef.current.classList.remove('element-show');
				tagListRef.current.classList.add('element-hide');
			}
		}	
	}

	function handleCheckClick(e) {
		if (newTagRef.current) {
			var newTag = newTagRef.current.value;
			props.tagWord(props.wordObj, newTag, true, true);
		}
		else {
			props.tagWord(props.wordObj, '', false, true);
		}
	}

	function handleClickCancel(e) {
		props.closeTagPopup();
	}

	function handleTagClick(el, tag) {
//		console.log('handleTagClick', el.dataset.tag, el.checked, tag);
//		console.log('add tag', tag, 'to wordObj', props.wordObj);
		props.tagWord(props.wordObj, el.dataset.tag, el.checked, !isAddTag);
	}

	return (
	<div ref={tagListRef} className="clicked-word-container tag-list-popup element-hide">
	  <div className="word-item-word">{props.wordObj.word}</div>
	  <div className="tag-list">
	    <div>Select one or more tags to associate with this word.</div>
	    { tags ? tags.map((item, ndx) => {
	        return <Tag key={ndx} label={item} wordTags={props.wordObj.tags} tagClick={handleTagClick} />
	    }) : null}

	    <div>To use a new tag, enter it here.</div>
	    { isAddTag ? (<div>
	      <div><input ref={newTagRef} type="text" placeholder="New Tag" /></div>
	      <hr />
	      </div>) : null }

	  </div>

	  { isAddTag ? (
	  <div className="tag-list-button-wrapper">
		<div className="badge tag-button tag-button-cancel" onClick={handleClickCancel}><i className="glyphicon glyphicon-remove"></i> Cancel</div>
	    <div className="badge tag-button" onClick={handleCheckClick}><i className="glyphicon glyphicon-ok"></i> Save</div>
	  </div>
	  ) : null }

	</div>
	);
}

export default TagList;
