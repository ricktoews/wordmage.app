const { URLSearchParams } = require('url');

// WARNING: This is a scaffold/demo implementation. In production you MUST
// verify the ID token's signature (use Google's JWKS) and use a secure
// server-side session store. This code decodes the id_token without
// verifying it for simplicity in the scaffold.

function decodeJWT(jwt) {
  try {
    const parts = jwt.split('.');
    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}

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

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.BASE_URL || '';
  const redirectUri = `${baseUrl}/.netlify/functions/auth-google-callback`;

  if (!clientId || !clientSecret) {
    return { statusCode: 500, body: 'Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET' };
  }

  // Exchange authorization code for tokens
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams();
  params.append('code', code);
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('redirect_uri', redirectUri);
  params.append('grant_type', 'authorization_code');

  try {
    const resp = await fetch(tokenUrl, { method: 'POST', body: params });
    const data = await resp.json();
    if (!data.id_token) {
      return { statusCode: 500, body: 'Failed to obtain id_token from Google' };
    }

    const idTokenPayload = decodeJWT(data.id_token);
    if (!idTokenPayload) {
      return { statusCode: 500, body: 'Failed to decode id_token' };
    }

    // Build a small user payload to give to the frontend. In production,
    // create or lookup the user in your DB and create a secure session.
    const user = {
      provider: 'google',
      provider_id: idTokenPayload.sub,
      email: idTokenPayload.email,
      name: idTokenPayload.name,
      picture: idTokenPayload.picture,
    };

    // For simplicity, encode the user payload into a base64 string and
    // include it in the redirect so the SPA can initialize the session.
    const payloadB64 = Buffer.from(JSON.stringify(user)).toString('base64');

    // Clear the oauth_state cookie and redirect back to /profile with payload
    const redirectLocation = `/profile?google_user=${encodeURIComponent(payloadB64)}`;
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
    console.error('auth-google-callback error', err);
    return { statusCode: 500, body: 'OAuth callback error' };
  }
};
