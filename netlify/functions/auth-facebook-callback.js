const { URLSearchParams } = require('url');

// WARNING: This is a scaffold/demo implementation. In production you MUST
// verify tokens properly and use a secure server-side session store.

exports.handler = async function (event, context) {
    const query = event.queryStringParameters || {};
    const code = query.code;
    const state = query.state;

    const cookieHeader = (event.headers && (event.headers.cookie || event.headers.Cookie)) || '';
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const stateCookie = cookies.find(c => c.startsWith('oauth_state='));
    const expectedState = stateCookie ? stateCookie.split('=')[1] : null;

    if (!code || !state || !expectedState || state !== expectedState) {
        return { statusCode: 400, body: 'Invalid OAuth callback (missing code/state or state mismatch)' };
    }

    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const baseUrl = process.env.BASE_URL || '';
    const redirectUri = `${baseUrl}/.netlify/functions/auth-facebook-callback`;

    if (!appId || !appSecret) {
        return { statusCode: 500, body: 'Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET' };
    }

    // Exchange authorization code for access token
    const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
    const params = new URLSearchParams();
    params.append('client_id', appId);
    params.append('client_secret', appSecret);
    params.append('redirect_uri', redirectUri);
    params.append('code', code);

    try {
        const resp = await fetch(tokenUrl, { method: 'POST', body: params });
        const data = await resp.json();
        if (!data.access_token) {
            return { statusCode: 500, body: 'Failed to obtain access_token from Facebook' };
        }

        // Use access token to fetch user profile information
        const profileUrl = `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${encodeURIComponent(
            data.access_token
        )}`;
        const profileResp = await fetch(profileUrl);
        const profileData = await profileResp.json();

        if (!profileData.id) {
            return { statusCode: 500, body: 'Failed to fetch user profile from Facebook' };
        }

        // Build a small user payload to give to the frontend. In production,
        // create or lookup the user in your DB and create a secure session.
        const user = {
            provider: 'facebook',
            provider_id: profileData.id,
            email: profileData.email || '',
            name: profileData.name || '',
            picture: profileData.picture?.data?.url || '',
        };

        // For simplicity, encode the user payload into a base64 string and
        // include it in the redirect so the SPA can initialize the session.
        const payloadB64 = Buffer.from(JSON.stringify(user)).toString('base64');

        // Clear the oauth_state cookie and redirect back to /profile with payload
        const redirectLocation = `/profile?facebook_user=${encodeURIComponent(payloadB64)}`;
        // Match cookie clearing flags with how we set them (omit Secure for http localhost)
        const cookieParts = ['oauth_state=deleted', 'Path=/', 'Max-Age=0', 'HttpOnly', 'SameSite=Lax'];
        if ((process.env.BASE_URL || '').startsWith('https')) {
            cookieParts.splice(4, 0, 'Secure');
        }
        const clearCookie = cookieParts.join('; ');
        return {
            statusCode: 302,
            headers: {
                Location: redirectLocation,
                'Set-Cookie': clearCookie,
            },
        };
    } catch (err) {
        console.error('auth-facebook-callback error', err);
        return { statusCode: 500, body: 'OAuth callback error' };
    }
};
