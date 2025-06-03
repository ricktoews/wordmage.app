import { useEffect, useRef, useState } from 'react';
import PopupHeader from './Popup-Header';

function ButtonTag(props) {
    const checkBoxRef = useRef(null);

    useEffect(() => {
        let selectedTag = false;
        if (Array.isArray(props.wordTags)) {
            selectedTag = props.wordTags.indexOf(props.tag) !== -1 ? true : false;
        }
        if (selectedTag) {
            checkBoxRef.current.classList.add('tag-selected');
        } else {
            checkBoxRef.current.classList.remove('tag-selected');
        }
    });

    const handleTagClick = e => {
        const el = e.target;
        props.handleTagClick(el, props.tag);
    }

    return (
        <div ref={checkBoxRef} className="badge badge-tag" onClick={handleTagClick}>{props.tag}</div>
    );
}

function PopupTagList(props) {
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
        props.tagListEl(tagListRef);
    }, []);

    function toggleTagPopup(showPopup) {
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

    function handleTagClick(el, tag) {
        // Toggle "checked" state for HTML checkbox, since capturing document click is interfering.
        // FIXME!
        const tagSelected = !el.classList.contains('tag-selected');
        if (el.classList.contains('tag-selected')) {
            el.classList.remove('tag-selected');
        } else {
            el.classList.add('tag-selected');
        }
        props.tagWord(props.wordObj, tag, tagSelected, !isAddTag);
    }

    return (
        <div ref={tagListRef}>
            <PopupHeader>Tag This Word</PopupHeader>

            <div className="popup-body">
                <div className="tag-list-popup">
                    <div className="word-item-word">{props.wordObj.word}</div>
                    <div className="word-item-def">{props.wordObj.def}</div>
                    <div className="tag-list">
                        <div className="tag-wrapper add-tags">
                            {tags ? tags.map((item, ndx) => {
                                return <ButtonTag key={ndx} tag={item} wordTags={props.wordObj.tags} handleTagClick={handleTagClick} />
                            }) : null}
                        </div>

                        {isAddTag ? (<div className="tag-wrapper">
                            <div className="form field-wrapper">
                                <div>Or enter a new tag</div>
                                <div><input ref={newTagRef} type="text" className="input-field" placeholder="New Tag" /></div>
                            </div>
                        </div>) : null}

                    </div>

                    {isAddTag ? (
                        <div className="button-wrapper">
                            <button className="btn" onClick={handleCheckClick}><i className="glyphicon glyphicon-ok"></i> Save</button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default PopupTagList;
