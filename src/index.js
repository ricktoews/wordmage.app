import React from 'react';
import { migrateRemovedTheme } from './utils/themes';
import { createRoot } from 'react-dom/client'; // Updated import
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import './public-content/public.css';
import reportWebVitals from './reportWebVitals';
import { ensureActiveWorkspace } from './utils/workspace';

const initialPathname = window.location.pathname;
migrateRemovedTheme();

(async () => {
	try {
		await ensureActiveWorkspace({ entryPath: initialPathname });
	} catch (error) {
		// Public reference pages remain usable when the workspace API is unavailable.
		console.error('Unable to initialize the workspace:', error);
	}
	//	await WordsInterface.initializeWordPool();

	// Use createRoot instead of ReactDOM.render
	const root = createRoot(document.getElementById('root'));
	root.render(
		<React.StrictMode>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</React.StrictMode>
	);
})();

reportWebVitals();
