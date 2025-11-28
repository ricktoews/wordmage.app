const crypto = require('crypto');

exports.handler = async function (event, context) {
  // Redirects the user to Google's OAuth 2.0 authorization endpoint.
  // Requires these environment variables set in Netlify: GOOGLE_CLIENT_ID and BASE_URL
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.BASE_URL || '';
  if (!clientId || !baseUrl) {
    return {
      statusCode: 500,
      body: 'Missing GOOGLE_CLIENT_ID or BASE_URL environment variables',
    };
  }

  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${baseUrl}/.netlify/functions/auth-google-callback`;
  const scope = encodeURIComponent('openid email profile');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&access_type=offline&prompt=consent`;

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
