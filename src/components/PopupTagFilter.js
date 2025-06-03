import { useEffect, useRef, useState } from 'react';
import PopupHeader from './Popup-Header';

function Tag(props) {

    const handleTagClick = e => {
        props.tagClick(props.tag);
    }

    return (
        <div className="badge badge-tag" onClick={handleTagClick}>{props.tag}</div>
    );
}

function PopupTagFilter(props) {
    const [tags, setTags] = useState(props.tagList);
    const tagListRef = useRef(null);

    // Show tag list
    useEffect(() => {
        //toggleTagPopup(props.showTags);
        setTags(props.tagList);
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

    function tagClick(tag) {
        props.tagWord(props.wordObj, tag, true, true);
    }

    return (
        <div ref={tagListRef}>
            <PopupHeader>Tag Filter</PopupHeader>

            <div className="popup-body">
                <div className="tag-list">
                    <div>Select tag for filtering.</div>
                    <div className="tag-wrapper">
                        {tags ? tags.map((item, ndx) => {
                            return <Tag key={ndx} tag={item} tagClick={tagClick} />
                        }) : null}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default PopupTagFilter;
