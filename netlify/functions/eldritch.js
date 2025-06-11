// netlify/functions/eldritch.js
exports.handler = async (event) => {
  const testEnv = process.env.ELDRITCH;

  if (!testEnv) {
    return {
      statusCode: 500,
      body: 'Missing test environment string',
    };
  }

  // Example: forward a request to environment test string 
  return {
    statusCode: 200,
    body: JSON.stringify({ testEnv }), // or do something more secure
  };
};

