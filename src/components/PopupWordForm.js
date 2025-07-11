import { useEffect, useState, useRef, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import WordsInterface from '../utils/words-interface';
import PopupHeader from './Popup-Header';
import { PopupContext } from './Popup';

function PopupWordForm(props) {
    var word = '', def = '', source = '', spotlight = true, originalDef = '';
    const [formHeader, setFormHeader] = useState('Add Word');

    const { requestConfirmation } = useContext(PopupContext);

    useEffect(() => {
        if (props.wordId) {
            // get word from custom list, from active list.
            var { word, def, source = '', original } = WordsInterface.getWordObjById(props.wordId);
            // If word already exists, set spotlight flag to false;
            if (WordsInterface.isSpotlightEntry(props.word)) {
                var { source = '' } = WordsInterface.getSpotlightEntry(props.word);
            }
            if (original) originalDef = original;
            setFormHeader('Edit Word');
            setNewWord(word);
            setNewDef(def);
            setNewSource(source);
        }
    }, [props.wordId])

    const [newWord, setNewWord] = useState(word);
    const [newDef, setNewDef] = useState(def);
    const [newSource, setNewSource] = useState(source);

    const handleWord = e => {
        var el = e.target;
        setNewWord(el.value);
    };

    const handleDef = e => {
        var el = e.target;
        setNewDef(el.value);
    };

    const handleSource = e => {
        var el = e.target;
        setNewSource(el.value);
    };

    const cancelWord = () => {
        props.cancelWordForm();
        // Just hide form; no need to update any components.
    }

    const saveWord = () => {
        // Need to save custom word, spotlight, or whatever.
        WordsInterface.saveCustomWord(props.wordId, newWord, newDef, newSource, spotlight);
        // If on Spotlight page, add word to active.
        if (props.location.pathname === '/spotlight') {
            WordsInterface.toggleActive(newWord);
        }

        // Finally, hide form. This should reach the top and hopefully cascade rerender components.
        props.cancelWordForm();
    }

    const deleteWord = async (e) => {
        const isDeletionConfirmed = await requestConfirmation();
        if (isDeletionConfirmed) {

            WordsInterface.deleteCustomWord(props.wordId);
        }
        props.cancelWordForm();
    }

    return (
        <div className="popup-word-form">
            <PopupHeader>{formHeader}</PopupHeader>

            <div className="popup-body">
                <div className="form field-wrapper">
                    {/* Word input field (custom), or word displayed only (built-in) */}
                    <div className="input-field">
                        <input placeholder="Word" onChange={handleWord} type="text" id="new-word" size="20" value={newWord} />
                    </div>

                    {/* Definition input field */}
                    <div className="input-field">
                        <textarea placeholder="Definition" onChange={handleDef} id="new-def" value={newDef}></textarea>
                    </div>

                    {/* Source. For ... ? */}
                    <div className="input-field">
                        <input placeholder="Source" onChange={handleSource} type="text" id="new-notes" size="20" value={newSource} />
                    </div>

                    {/* Cancel / Save buttons */}
                    <div className="button-wrapper">
                        <button className="btn" onClick={saveWord}><i className="glyphicon glyphicon-ok"></i> Save</button>
                        {props.wordId && <button className="btn" onClick={deleteWord}><i className="glyphicon glyphicon-trash"></i></button>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withRouter(PopupWordForm);

