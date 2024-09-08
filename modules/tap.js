const { fetchApi } = require('../utils/api');

async function tap(config, bearerToken) {
  const count = Math.floor(Math.random() * (config.maxTaps - config.minTaps + 1)) + config.minTaps;
  const timestamp = Math.floor(Date.now() / 1000);

  try {
    const response = await fetchApi('/tap', 'POST', {
      count: count,
      availableTaps: 9,
      timestamp: timestamp
    }, bearerToken);

    const {
      totalCoins,
      balanceCoins,
      availableTaps,
      earnPassivePerSec,
      earnPassivePerHour,
      lastPassiveEarn,
    } = response.clickerUser;

    console.log({
      totalCoins,
      balanceCoins,
      availableTaps,
      earnPassivePerSec,
      earnPassivePerHour,
      lastPassiveEarn,
    });

    if (balanceCoins < 0) {
      process.exit();
    }

  } catch (error) {
    console.error('Ошибка при выполнении тапа:', error);
  }
}

module.exports = tap;