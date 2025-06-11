// netlify/functions/botpress.js
exports.handler = async (event) => {
  const clientId = process.env.BOTPRESS_CLIENT_ID;

  if (!clientId) {
    return {
      statusCode: 500,
      body: 'Missing Botpress client ID',
    };
  }

  // Example: forward a request to client ID
  return {
    statusCode: 200,
    body: JSON.stringify({ clientId }), // or do something more secure
  };
};


