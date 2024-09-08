const API_URL = 'https://api.hamsterkombatgame.io/clicker';

async function fetchApi(endpoint, method = 'POST', body = null, bearerToken, isExternalApi = false) {
  const url = isExternalApi ? endpoint : `${API_URL}${endpoint}`;

  const headers = {
    'accept': 'application/json'
  };

  if (bearerToken) {
    headers['authorization'] = `Bearer ${bearerToken}`;
  }

  if (isExternalApi) {
    headers['Host'] = new URL(endpoint).host;
    headers['Origin'] = 'https://gamepromo.io';
    headers['Referer'] = 'https://gamepromo.io/';
    headers['Content-Type'] = 'application/json; charset=utf-8';
  } else {
    headers['sec-fetch-site'] = 'same-site';
    headers['accept-language'] = 'ru';
    headers['accept-encoding'] = 'gzip, deflate, br';
    headers['sec-fetch-mode'] = 'cors';
    headers['origin'] = 'https://hamsterkombatgame.io';
    headers['referer'] = 'https://hamsterkombatgame.io/';
    headers['sec-fetch-dest'] = 'empty';
    headers['user-agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
    if (body) {
      headers['content-type'] = 'application/json';
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  if (!response.ok) {
    // console.log('Ошибка запроса:');
    // console.log('URL:', url);
    // console.log('Метод:', method);
    // console.log('Заголовки запроса:', headers);
    // console.log('Тело запроса:', body);
    // console.log('Статус ответа:', response.status);
    // console.log('Текст статуса:', response.statusText);
    // console.log('Заголовки ответа:', Object.fromEntries(response.headers));
    // console.log('Тело ответа:', await response.text());
    throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
  }

  return response.json();
}

module.exports = { fetchApi };
