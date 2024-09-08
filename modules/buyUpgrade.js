const { fetchApi } = require('../utils/api');

async function buyUpgrade(config, bearerToken) {
  try {
    // Perform a tap to get the current balance
    const tapResponse = await fetchApi('/tap', 'POST', {
      count: 11,
      availableTaps: 9,
      timestamp: Math.floor(Date.now() / 1000)
    }, bearerToken);

    const currentBalance = tapResponse.clickerUser.balanceCoins;
    const earnPassivePerHour = tapResponse.clickerUser.earnPassivePerHour;

    // If balance is less than earnPassivePerHour, stop execution
    if (currentBalance < earnPassivePerHour) {
      console.log(`Not enough coins for purchase. Current balance: ${currentBalance}, earnPassivePerHour: ${earnPassivePerHour}`);
      return;
    }

    // Get available upgrades
    const response = await fetchApi('/upgrades-for-buy', 'POST', null, bearerToken);
    const upgrades = response.upgradesForBuy;

    let bestAffordableUpgrade = null;
    let bestAffordablePayback = Infinity;
    let bestOverallUpgrade = null;
    let bestOverallPayback = Infinity;

    for (const upgrade of upgrades) {
      if (upgrade.isAvailable && !upgrade.cooldownSeconds && !upgrade.isExpired) {
        const payback = upgrade.price / upgrade.profitPerHourDelta;
        
        if (upgrade.price <= currentBalance) {
          if (payback < bestAffordablePayback && payback <= config.maxPayback) {
            bestAffordableUpgrade = upgrade;
            bestAffordablePayback = payback;
          }
        }
        
        if (payback < bestOverallPayback) {
          bestOverallUpgrade = upgrade;
          bestOverallPayback = payback;
        }
      }
    }

    if (bestAffordableUpgrade) {
      console.log(`Available upgrade with best rate we can buy is: ${bestAffordableUpgrade.name}, price: ${bestAffordableUpgrade.price}, profitPerHourDelta: ${bestAffordableUpgrade.profitPerHourDelta}, payback: ${bestAffordablePayback.toFixed(2)} hours`);
      
      const buyResponse = await fetchApi('/buy-upgrade', 'POST', {
        upgradeId: bestAffordableUpgrade.id,
        timestamp: Math.floor(Date.now() / 1000)
      }, bearerToken);
      
      console.log(`Upgrade purchased: ${bestAffordableUpgrade.id} for ${bestAffordableUpgrade.price} coins`);
      console.log(`New balance: ${currentBalance - bestAffordableUpgrade.price}`);
      return buyResponse;
    } else {
      console.log(`No suitable upgrades for purchase. Current balance: ${currentBalance}`);
    }

    if (bestOverallUpgrade && bestOverallUpgrade !== bestAffordableUpgrade) {
      console.log(`Available upgrade with best rate we cannot buy is: ${bestOverallUpgrade.name}, price: ${bestOverallUpgrade.price}, profitPerHourDelta: ${bestOverallUpgrade.profitPerHourDelta}, payback: ${bestOverallPayback.toFixed(2)} hours`);
    }

  } catch (error) {
    console.error('Error while buying upgrade:', error);
  }
}

module.exports = buyUpgrade;
