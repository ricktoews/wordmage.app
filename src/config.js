export const CONFIG = {
    domain: 'https://wordmage.toews-api.com'
};

// Set your Google OAuth Client ID here (or inject via env/config in production).
// Example: '12345-abc.apps.googleusercontent.com'
export const GOOGLE_CONFIG = {
    // Prefer the Create React App style env var. Netlify/CI should set
    // `REACT_APP_GOOGLE_CLIENT_ID`. We also allow a direct `GOOGLE_CLIENT_ID`
    // fallback at build time for non-CRA setups.
    googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || null
};

// Set your Facebook App ID here (or inject via env/config in production).
// Example: '1234567890123456'
export const FACEBOOK_CONFIG = {
    // Prefer the Create React App style env var. Netlify/CI should set
    // `REACT_APP_FACEBOOK_APP_ID`. We also allow a direct `FACEBOOK_APP_ID`
    // fallback at build time for non-CRA setups.
    facebookAppId: process.env.REACT_APP_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || null
};