import React from 'react';
import ReactDOM from 'react-dom';

const DeleteModal = ({ show, hide }) => show ? ReactDOM.createPortal(
	<React.Fragment>
	<div className="modal-container">
	  <div className="modal-wrapper">
	    <div className="word-form">

	      <h1>Delete</h1>

	      {/* Cancel / Save buttons */}
	      <div className="button-wrapper">
	        <button className="btn btn-cancel" onClick={hide}>Cancel</button>
	        <button className="btn btn-save" onClick={}>Save</button>
	      </div>

	    </div>
	  </div>
	</div>
	</React.Fragment>, document.body) : null;

export default DeleteModal;


