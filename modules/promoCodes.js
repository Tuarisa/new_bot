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

const EVENTS_DELAY = 20000;
const MAX_RETRIES = 5;

async function login(clientId, appToken, attempt = 0) {
  if (attempt > MAX_RETRIES) {
    console.log(`Login attempt ${attempt} failed, returning empty token`);
    return '';
  }
  if (!clientId) {
    throw new Error('no client id');
  }
  try {
    const response = await fetchApi('https://api.gamepromo.io/promo/login-client', 'POST', {
      appToken: appToken,
      clientId: uuidv4(),
      clientOrigin: 'deviceid'
    });
    if (!response.clientToken) {
      console.log(`Login attempt ${attempt} failed, retrying...`);
      await sleep(5000 * attempt + Math.random() * 20 * 5000);
      return login(clientId, appToken, attempt + 1);
    }
    return response.clientToken;
  } catch (error) {
    console.error(`Login attempt ${attempt} failed with error: ${error.message}, retrying...`);
    await sleep(5000 * attempt + Math.random() * 20 * 5000);
    return login(clientId, appToken, attempt + 1);
  }
}

async function emulateProgress(clientToken, promoId) {
  if (!clientToken) {
    throw new Error('no access token');
  }
  try {
    const response = await fetchApi('https://api.gamepromo.io/promo/register-event', 'POST', {
      promoId: promoId,
      eventId: uuidv4(),
      eventOrigin: 'undefined'
    }, clientToken);
    return response.hasCode;
  } catch (error) {
    console.error(`Emulate progress failed with error: ${error.message}`);
    return false;
  }
}

async function generateKey(clientToken, promoId) {
  if (!clientToken) {
    throw new Error('no access token');
  }
  try {
    const response = await fetchApi('https://api.gamepromo.io/promo/create-code', 'POST', {
      promoId: promoId
    }, clientToken);
    return response.promoCode;
  } catch (error) {
    console.error(`Generate key failed with error: ${error.message}`);
    return '';
  }
}

async function startProcess(appToken, promoId) {
  try {
    let tokens = await Promise.all([...Array(4)].map(() => login(uuidv4(), appToken)));
    tokens = tokens.filter(token => token !== '');

    console.log('logins, tokens:', tokens);

    const generateKeyPromises = tokens.map(async (token, index) => {
      for (let i = 0; i < 50; i++) {
        const hasCode = await emulateProgress(token, promoId);
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

async function fetchPromos(config) {
  try {
    const response = await fetchApi('/get-promos', 'POST', null, config.bearerToken);
    return response;
  } catch (error) {
    console.error('Error fetching promos:', error);
  }
}

async function applyPromoCode(promoCode, config) {
  try {
    const result = await fetchApi('/apply-promo', 'POST', { promoCode }, config.bearerToken);
    return result;
  } catch (error) {
    console.error('Error applying promo code:', error);
  }
}

async function processPromos(config) {
  try {
    const { states, promos } = await fetchPromos(config);
    if (!states || states.length == 0) {
      return;
    }

    for (const promo of promos) {
      let state = states.find(s => s.promoId == promo.promoId);
      if (!state || state.receiveKeysToday < 4 || state.receiveKeysToday < promo.keysPerDay) {
        const appConfig = Object.values(appConfigs).find(config => config.promoId === promo.promoId);
        const receiveKeysToday = state ? state.receiveKeysToday : 0;

        const keysToFetch = promo.keysPerDay - receiveKeysToday;
        let keys;
        if (appConfig) {
          keys = await startProcess(appConfig.appToken, appConfig.promoId);
        } else {
          keys = await startProcess(promo.promoId, promo.promoId);
        }

        for (let i = 0; i < Math.min(keysToFetch, keys.length); i++) {
          await applyPromoCode(keys[i], config);
        }
        break;
      }
    }
  } catch (e) {
    console.log(e);
  }
}

module.exports = processPromos;
