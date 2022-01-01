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
	const newTagRef = useRef(null);
	const tagListRef = useRef(null);

	// Meant to focus on New Tag field.
	useEffect(() => {
		if (newTagRef.current) {
			newTagRef.current.focus();
		}
		newTagRef.current.value = '';
	}, [props.showTags]);

	// Show tag list
	useEffect(() => {
		if (tagListRef.current) {
			if (props.showTags) {
				tagListRef.current.classList.remove('element-hide');
				tagListRef.current.classList.add('element-show');
			}
			else {
				tagListRef.current.classList.remove('element-show');
				tagListRef.current.classList.add('element-hide');
			}
		}	
		setTags(props.tagList);
	}, [props.showTags]);

	function handleCheckClick(e) {
		var newTag = newTagRef.current.value;
		props.tagWord(props.wordObj, newTag, true, true);
	}

	function handleTagClick(el, tag) {
//		console.log('handleTagClick', el.dataset.tag, el.checked, tag);
//		console.log('add tag', tag, 'to wordObj', props.wordObj);
		props.tagWord(props.wordObj, el.dataset.tag, el.checked);
	}

	return (
	<div ref={tagListRef} className="tag-list-popup element-hide">
	  <div className="button-wrapper">
	    <div className="tag-button save-tag" onClick={handleCheckClick}><i className="glyphicon glyphicon-ok"></i></div>
	  </div>
	  <div className="tag-list">
	    <div><input ref={newTagRef} type="text" placeholder="New Tag" /></div>
	    <hr />
	  { tags ? tags.map((item, ndx) => {
	      return <Tag key={ndx} label={item} wordTags={props.wordObj.tags} tagClick={handleTagClick} />
	  }) : null}
	  </div>
	</div>
	);
}

export default TagList;
