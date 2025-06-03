import { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { FacebookShareButton, FacebookIcon } from "react-share";
import { TwitterShareButton, XIcon } from "react-share";

import WordsInterface from '../utils/words-interface';
import PopupHeader from './Popup-Header';

function WordShare(props) {
    const [wordObj, setWordObj] = useState(null);
    var word = '', def = '', source = '', spotlight = true, originalDef = '';

    useEffect(() => {
        // get word from custom list, from active list.
        //const obj = WordsInterface.getWordObjById(props.wordId);
        setWordObj(props.shareWord)
    }, [props.shareWord])

    function FacebookShare(wordObj) {
        return (
            <button className="btn btn-share"><FacebookShareButton
                url={'https://wordmage.app/spotlight/' + wordObj.word}
                quote={`${wordObj.word.toUpperCase()}. ${wordObj.def}`}
                className={'share-btn'}>
                <div className="share-btn-label"><div><FacebookIcon size={32} round={true} /></div><div>Share on Facebook</div></div>
            </FacebookShareButton></button>
        );

    }

    function TwitterShare(wordObj) {
        return (
            <button className="btn btn-share"><TwitterShareButton
                url={'https://wordmage.app/spotlight/' + wordObj.word}
                title={`${wordObj.word.toUpperCase()}. ${wordObj.def}`}
                hashtags={['wordmage']}
                className={'share-btn'}>
                <div className="share-btn-label"><div><XIcon size={32} round={true} /></div><div>Share on X</div></div>
            </TwitterShareButton></button>
        );
    }

    return wordObj ? (
        <div>
            <PopupHeader>Share Word</PopupHeader>

            <div className="popup-body">
                <div className="button-wrapper stack-buttons">
                    {FacebookShare(wordObj)}
                    {TwitterShare(wordObj)}
                </div>
            </div>
        </div>
    ) : null;
}

export default withRouter(WordShare);

