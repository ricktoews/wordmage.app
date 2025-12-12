import { useEffect, useState } from 'react';

function PopupAIExplain(props) {
    const { word, definition, onClose } = props;
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (word) {
            fetchExplanation();
        }
    }, [word]);

    const fetchExplanation = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/.netlify/functions/explain-word', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word, definition })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to get explanation');
            }

            setExplanation(data.explanation);
        } catch (err) {
            console.error('Error fetching explanation:', err);
            // Try to get more error details from response
            const errorMsg = err.message || 'Sorry, I couldn\'t get an explanation right now. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-explain-popup">
            <div className="ai-explain-content">
                <div className="ai-explain-header">
                    <h3>
                        <i className="glyphicon glyphicon-flash"></i> 
                        {' '}Explaining: <span className="ai-explain-word">{word}</span>
                    </h3>
                    <button className="ai-explain-close" onClick={onClose}>
                        <i className="glyphicon glyphicon-remove"></i>
                    </button>
                </div>
                <div className="ai-explain-body">
                    {loading && (
                        <div className="ai-explain-loading">
                            <div className="ai-loading-spinner"></div>
                            <p>Thinking...</p>
                        </div>
                    )}
                    {error && (
                        <div className="ai-explain-error">
                            <i className="glyphicon glyphicon-exclamation-sign"></i>
                            <p>{error}</p>
                            <button className="ai-retry-btn" onClick={fetchExplanation}>
                                Try Again
                            </button>
                        </div>
                    )}
                    {!loading && !error && explanation && (
                        <div className="ai-explain-text">
                            {explanation}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PopupAIExplain;
