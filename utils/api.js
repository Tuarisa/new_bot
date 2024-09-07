const fetch = require('node-fetch');

const API_URL = 'https://api.hamsterkombatgame.io/clicker';

async function fetchApi(endpoint, method = 'POST', body = null, bearerToken) {
  const isExternalApi = endpoint.startsWith('http');
  const url = isExternalApi ? endpoint : `${API_URL}${endpoint}`;

  const headers = {
    'accept': '*/*',
    'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'authorization': bearerToken,
    'cache-control': 'no-cache',
    'pragma': 'no-cache',
    'priority': 'u=1, i',
    'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'Referer': 'https://hamsterkombatgame.io/',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    ...(isExternalApi ? {} : { headers }),
    body: body ? JSON.stringify(body) : null
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

module.exports = { fetchApi };
