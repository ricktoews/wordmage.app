import { useContext, useEffect, useState } from 'react';
import { WordMageContext } from './WordMageContext';

function KeyCapture(props) {
    const { contextValue, setContextValue } = useContext(WordMageContext);
    const [keyCaptured, setKeyCaptured] = useState('');

    const handleKeyDown = ({ keyCode }) => {
        setKeyCaptured(keyCode);
        setContextValue({ ...contextValue, capturedKey: String.fromCharCode(keyCode) });
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    return props.children;
}

export default KeyCapture;