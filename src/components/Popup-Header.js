import { useEffect, useRef, useState } from "react";


function PopupHeader(props) {

    const handleCloseClick = e => {
        const backgroundClicked = e.target.classList.contains('close-icon');
        if (backgroundClicked) {
            props.handleBackgroundClick();
        }
    }

    return <div className="popup-header">

        <div className="popup-title">
            {props.children}
        </div>
        <div className="close-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-4 w-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
        </div>

    </div>;
}

export default PopupHeader;