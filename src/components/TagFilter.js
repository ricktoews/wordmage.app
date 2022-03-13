import { useEffect, useRef, useState } from 'react';

function Tag(props) {

	const handleTagClick = e => {
		props.tagClick(props.tag);
	}

	return (
	<div className="badge badge-tag" onClick={handleTagClick}>{props.tag}</div>
	);
}

function TagFilter(props) {
	const [tags, setTags] = useState(props.tagList);
	const tagListRef = useRef(null);

	// Show tag list
	useEffect(() => {
		toggleTagPopup(props.showTags);
		setTags(props.tagList);
//		setIsAddTag(!!props.wordObj.word);
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

	function tagClick(tag) {
		console.log('tagClick', tag);
//		console.log('add tag', tag, 'to wordObj', props.wordObj);
		props.tagWord(props.wordObj, tag, true, true);
	}

	return (
	<div ref={tagListRef} className="clicked-word-container tag-list-popup element-hide">
	  <div className="tag-list">
		<div>Select tag for filtering.</div>
	    { tags ? tags.map((item, ndx) => {
	        return <Tag key={ndx} tag={item} tagClick={tagClick} />
	    }) : null}

	  </div>
	</div>
	);
}

export default TagFilter;
