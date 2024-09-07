const { fetchApi } = require('../utils/api');

async function buyUpgrade(config, bearerToken) {
  try {
    // Get available upgrades
    const response = await fetchApi('/upgrades-for-buy', 'POST', null, bearerToken);
    const upgrades = response.upgradesForBuy;

    let bestUpgrade = null;
    let bestPayback = Infinity;

    for (const upgrade of upgrades) {
      // Check if the upgrade is available and not on cooldown
      if (upgrade.isAvailable && !upgrade.cooldownSeconds) {
        const payback = upgrade.price / upgrade.profitPerHourDelta;
        // Compare payback with the configured maxPayback
        if (payback < bestPayback && payback <= config.maxPayback) {
          bestUpgrade = upgrade;
          bestPayback = payback;
        }
      }
    }

    if (bestUpgrade) {
      // Buy the best upgrade
      const buyResponse = await fetchApi('/buy-upgrade', 'POST', {
        upgradeId: bestUpgrade.id,
        timestamp: Math.floor(Date.now() / 1000)
      }, bearerToken);
      
      // Log the purchase
      console.log(`Upgrade purchased: ${bestUpgrade.id} for ${bestUpgrade.price} coins`);
      console.log(`Payback period (in hours): ${bestPayback}`);
      return buyResponse;
    } else {
      console.log('No suitable upgrades available for purchase');
    }
  } catch (error) {
    console.error('Error while buying upgrade:', error);
  }
}

module.exports = buyUpgrade;
