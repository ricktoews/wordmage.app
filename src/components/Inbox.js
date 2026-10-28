import WordScroller from './WordScroller';

function Inbox({ words, isLoading, error, onAIExplain }) {
    return (
        <div className="word-list-page-container album-content-page">
            <div className="favorites-toolbar">
                <div className="favorites-toolbar-content">
                    <div className="favorites-toolbar-title">Inbox</div>
                </div>
            </div>
            <div className="word-list-wrapper">
                {isLoading ? <p role="status">Loading inbox words…</p> : error ? (
                    <p role="alert">{error}</p>
                ) : words.length === 0 ? <p>Your inbox is empty.</p> : (
                    <WordScroller pool={words} startingNdx={0} listType="inbox" onAIExplain={onAIExplain} />
                )}
            </div>
        </div>
    );
}

export default Inbox;
