const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  const key = (event.queryStringParameters && event.queryStringParameters.key) || '';
  if (!key) {
    return { statusCode: 400, body: 'missing key' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (!process.env.BLOBS_SITE_ID || !process.env.BLOBS_TOKEN) {
      return { statusCode: 500, headers, body: 'env vars missing: BLOBS_SITE_ID=' + (!!process.env.BLOBS_SITE_ID) + ' BLOBS_TOKEN=' + (!!process.env.BLOBS_TOKEN) };
    }
    const store = getStore({
      name: 'alba-data',
      siteID: process.env.BLOBS_SITE_ID,
      token: process.env.BLOBS_TOKEN
    });

    if (event.httpMethod === 'GET') {
      const value = await store.get(key);
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: value || '[]'
      };
    }

    if (event.httpMethod === 'POST') {
      await store.set(key, event.body || '');
      return { statusCode: 200, headers, body: 'ok' };
    }

    return { statusCode: 405, headers, body: 'method not allowed' };
  } catch (err) {
    return { statusCode: 500, headers, body: 'server error: ' + err.message };
  }
};
