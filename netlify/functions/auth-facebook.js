const crypto = require('crypto');

exports.handler = async function (event, context) {
    // Redirects the user to Facebook's OAuth 2.0 authorization endpoint.
    // Requires these environment variables set in Netlify: FACEBOOK_APP_ID and BASE_URL
    const appId = process.env.FACEBOOK_APP_ID;
    const baseUrl = process.env.BASE_URL || '';
    if (!appId || !baseUrl) {
        return {
            statusCode: 500,
            body: 'Missing FACEBOOK_APP_ID or BASE_URL environment variables',
        };
    }

    const state = crypto.randomBytes(16).toString('hex');
    const redirectUri = `${baseUrl}/.netlify/functions/auth-facebook-callback`;
    const scope = encodeURIComponent('email,public_profile');
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${encodeURIComponent(
        appId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;

    // Set a cookie with state to validate callback (not secure beyond this demo)
    // Do not add the 'Secure' flag when running on an http (localhost) BASE_URL,
    // otherwise the browser will refuse to set the cookie over plain HTTP.
    const cookieParts = [`oauth_state=${state}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
    if (baseUrl.startsWith('https')) {
        cookieParts.splice(2, 0, 'Secure');
    }
    const cookie = cookieParts.join('; ');

    return {
        statusCode: 302,
        headers: {
            Location: authUrl,
            'Set-Cookie': cookie,
        },
    };
};
