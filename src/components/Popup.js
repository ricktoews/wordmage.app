import { useEffect, useRef, useState, createContext } from "react";

export const PopupContext = createContext();

function Popup(props) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [resolveConfirm, setResolveConfirm] = useState(null);

    const requestConfirmation = () => {
        setIsConfirmOpen(true);
        return new Promise((resolve) => setResolveConfirm(() => resolve));
    };

    const handleConfirm = () => {
        resolveConfirm?.(true);
        setIsConfirmOpen(false);
        setResolveConfirm(null);
    };

    const handleCancel = () => {
        resolveConfirm?.(false);
        setIsConfirmOpen(false);
        setResolveConfirm(null);
    };

    const [visibleState, setVisibleState] = useState(props.isVisible);
    const popupRef = useRef();

    useEffect(() => {
        setVisibleState(props.isVisible);
    }, [props.isVisible])

    const isCloseIcon = (e) => {
        return e.target.closest('.close-icon');
    }

    const handlePopupClick = e => {
        // Close popup because "x" in upper right corner clicked.
        if (isCloseIcon(e)) {
            props.handleBackgroundClick();
        }

        // Close popup because background outside of popup clicked.
        const backgroundClicked = e.target.classList.contains('popup-container');
        if (backgroundClicked) {
            props.handleBackgroundClick();
        }
    }

    return visibleState ? <PopupContext.Provider value={{ requestConfirmation }}><div ref={popupRef} onClick={handlePopupClick} className="popup-container">
        <div className="popup">
            {isConfirmOpen && (
                <div className="confirm-action">
                    <div className="confirmation-text">Are you sure?</div>
                    <div className="confirmation-buttons">
                        <button className="btn" onClick={handleCancel}>
                            <i className="glyphicon glyphicon-remove"></i>
                        </button>
                        <button className="btn" onClick={handleConfirm}>
                            <i className="glyphicon glyphicon-ok"></i>
                        </button>
                    </div>
                </div>
            )}

            {props.children}
        </div>

    </div></PopupContext.Provider> : null;
}

export default Popup;