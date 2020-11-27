function RouteWordList() {

	return (
	  <div className={'word-list-container' + (props.view !== 'word-list-container' ? ' no-hide-section' : '')}>
	    <WordList 
	      popupConfirm={word => { props.popupConfirm(word) } }
	      popupWordForm={word => { props.popupWordForm(word) } }
	      addWordState={props.addWordState}
	      cancelAddWord={props.cancelAddWord}
	      fullWordList={fullWordList}
	      toggleActive={toggleActive}
	      updateWordList={updateWordList} />
	  </div>
	);
}
