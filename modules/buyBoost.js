const { fetchApi } = require('../utils/api');

async function buyBoost(config, bearerToken) {
  try {
    const response = await fetchApi('/boosts-for-buy', 'POST', null, bearerToken);
    const boost = response.boostsForBuy.find(b => b.id === 'BoostFullAvailableTaps');

    if (boost && boost.cooldownSeconds === 0) {
      const buyResponse = await fetchApi('/buy-boost', 'POST', {
        boostId: boost.id,
        timestamp: Math.floor(Date.now() / 1000)
      }, bearerToken);
      console.log('Boost purchased');
      return true;
    } else {
      console.log('BoostFullAvailableTaps not available or still on cooldown.');
    }
  } catch (error) {
    console.error('Ошибка при покупке буста:', error);
  }
  return false;
}

module.exports = buyBoost;