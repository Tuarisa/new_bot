const { fetchApi } = require('../utils/api');
const { v4: uuidv4 } = require('uuid');
const { sleep } = require('../utils/helpers');

const appConfigs = {
  Bike: {
    appToken: 'd28721be-fd2d-4b45-869e-9f253b554e50',
    promoId: '43e35910-c168-4634-ad4f-52fd764a843f'
  },
  Clone: {
    appToken: '74ee0b5b-775e-4bee-974f-63e7f4d5bacb',
    promoId: 'fe693b26-b342-4159-8808-15e3ff7f8767'
  },
  Chain: {
    appToken: 'd1690a07-3780-4068-810f-9b5bbf2931b2',
    promoId: 'b4170868-cef0-424f-8eb9-be0622e8e8e3'
  },
  Train: {
    appToken: '82647f43-3f87-402d-88dd-09a90025313f',
    promoId: 'c4480ac7-e178-4973-8061-9ed5b2e17954'
  },
  Gang: {
    appToken: 'b6de60a0-e030-48bb-a551-548372493523',
    promoId: 'c7821fa7-6632-482c-9635-2bd5798585f9'
  }
};

const EVENTS_DELAY = 60000;
const MAX_RETRIES = 5;

async function login(clientId, appToken, attempt = 0) {
  if (attempt > MAX_RETRIES) {
    console.log(`Попытка входа ${attempt} не удалась, возвращаем пустой токен`);
    return '';
  }
  if (!clientId) {
    throw new Error('отсутствует client id');
  }
  try {
    const response = await fetchApi('https://api.gamepromo.io/promo/login-client', 'POST', {
      appToken: appToken,
      clientId: uuidv4(),
      clientOrigin: 'deviceid'
    }, null, true);
    if (!response.clientToken) {
      console.log(`Попытка входа ${attempt} не удалась, повторяем...`);
      await sleep(5000 * attempt + Math.random() * 20 * 5000);
      return login(clientId, appToken, attempt + 1);
    }
    return response.clientToken;
  } catch (error) {
    console.error(`Попытка входа ${attempt} не удалась с ошибкой: ${error.message}, повторяем...`);
    await sleep(5000 * attempt + Math.random() * 20 * 5000);
    return login(clientId, appToken, attempt + 1);
  }
}

async function emulateProgess(clientToken, promoId) {
  if (!clientToken) {
    throw new Error('отсутствует access token');
  }
  try {
    const response = await fetchApi('https://api.gamepromo.io/promo/register-event', 'POST', {
      promoId: promoId,
      eventId: uuidv4(),
      eventOrigin: 'undefined'
    }, clientToken, true);
    return response.hasCode;
  } catch (error) {
    console.error(`Эмуляция прогресса не удалась с ошибкой: ${error.message}`);
    return false;
  }
}

async function generateKey(clientToken, promoId) {
  if (!clientToken) {
    throw new Error('отсутствует access token');
  }
  try {
    const response = await fetchApi('https://api.gamepromo.io/promo/create-code', 'POST', {
      promoId: promoId
    }, clientToken, true);
    return response.promoCode;
  } catch (error) {
    console.error(`Генерация ключа не удалась с ошибкой: ${error.message}`);
    return '';
  }
}

async function startProcess(appToken, promoId) {
  try {
    let tokens = await Promise.all([...Array(1)].map(() => login(uuidv4(), appToken)));
    tokens = tokens.filter(token => token !== '');

    console.log('logins, tokens:', tokens);

    const generateKeyPromises = tokens.map(async (token, index) => {
      for (let i = 0; i < 50; i++) {
        const hasCode = await emulateProgess(token, promoId);
        if (hasCode) {
          console.log(`Token ${index + 1} ${token} has code`);
          break;
        }
        await sleep(EVENTS_DELAY);
      }
      const code = await generateKey(token, promoId);
      console.log(`Generated key for token ${index + 1}: ${code}`);
      return code;
    });

    const keys = await Promise.all(generateKeyPromises);
    return keys;
  } catch (error) {
    console.error('Ошибка:', error.message);
    return [];
  }
}

async function fetchPromos(bearerToken) {
  try {
    const response = await fetchApi('/get-promos', 'POST', null, bearerToken);
    return response;
  } catch (error) {
    console.error('Error fetching promos:', error);
  }
}

async function applyPromoCode(promoCode, bearerToken) {
  try {
    const result = await fetchApi('/apply-promo', 'POST', { promoCode }, bearerToken);
    return result;
  } catch (error) {
    console.error('Error applying promo code:', error);
  }
}

async function processPromos(config, bearerToken) {
  try {
    const { states, promos } = await fetchPromos(bearerToken);
    if (!states || states.length == 0) {
      return;
    }

    const eligiblePromos = promos.filter(promo => {
      let state = states.find(s => s.promoId == promo.promoId);
      return !state || state.receiveKeysToday < promo.keysPerDay;
    });

    if (eligiblePromos.length > 0) {
      const randomIndex = Math.floor(Math.random() * eligiblePromos.length);
      const selectedPromo = eligiblePromos[randomIndex];

      const appConfig = Object.values(appConfigs).find(config => config.promoId === selectedPromo.promoId);
      let keys;

      if (appConfig) {
        keys = await startProcess(appConfig.appToken, appConfig.promoId);
      } else {
        keys = await startProcess(selectedPromo.promoId, selectedPromo.promoId);
      }

      if (keys.length > 0) {
        await applyPromoCode(keys[0], bearerToken);
      }
    }
  } catch (e) {
    console.log(e);
  }
}

module.exports = processPromos;
