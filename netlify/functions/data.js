const KV_URL = 'https://kvdb.io/GGFgH5vnSEN8pXSksX1nwN/';

exports.handler = async function(event) {
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
    if (event.httpMethod === 'GET') {
      const r = await fetch(KV_URL + key);
      const text = r.ok ? await r.text() : '[]';
      return { statusCode: 200, headers: { ...headers, 'Content-Type': 'application/json' }, body: text };
    }

    if (event.httpMethod === 'POST') {
      const r = await fetch(KV_URL + key, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: event.body
      });
      const bodyText = await r.text().catch(() => '');
      return { statusCode: r.ok ? 200 : 502, headers, body: r.ok ? 'ok' : `kvdb ${r.status}: ${bodyText}` };
    }

    return { statusCode: 405, headers, body: 'method not allowed' };
  } catch (err) {
    return { statusCode: 500, headers, body: 'server error: ' + err.message };
  }
};
