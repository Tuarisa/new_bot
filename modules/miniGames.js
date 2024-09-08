const { fetchApi } = require('../utils/api');
const { createSignature } = require('../utils/signature');
const { randomSleep } = require('../utils/helpers');

async function miniGames(config, bearerToken) {
  try {
    console.log('Начинаем процесс мини-игр');
    const configResponse = await fetchApi('/config', 'POST', null, bearerToken);
    
    if (!configResponse.dailyKeysMiniGames) {
      console.error('Не удалось получить данные о ежедневных мини-играх');
      return;
    }

    const supportedGames = config.supportedGames;

    for (const gameId of supportedGames) {
      const game = configResponse.dailyKeysMiniGames[gameId];
      
      if (!game) {
        console.warn(`Мини-игра ${gameId} не найдена в конфигурации`);
        continue;
      }

      if (game.isClaimed) {
        console.log(`Ежедневная мини-игра ${gameId} уже получена`);
        continue;
      }

      if (gameId === 'Candles' && game.remainSecondsToNextAttempt > 0) {
        console.log(`Ежедневная мини-игра ${gameId} на перезарядке`);
        continue;
      }

      console.log(`Начинаем мини-игру ${gameId}...`);
      const startResponse = await fetchApi('/start-keys-minigame', 'POST', { miniGameId: gameId }, bearerToken);

      if (!startResponse.dailyKeysMiniGames || startResponse.dailyKeysMiniGames.isClaimed) {
        console.log(`Мини-игра ${gameId} уже получена или недоступна`);
        continue;
      }

      const waitTime = gameId === 'Candles' 
        ? 45000
        : Math.floor(Math.random() * (120000 - 35000 + 1)) + 35000;

      console.log(`Ожидание ${waitTime / 1000} секунд, мини-игра ${gameId} будет завершена...`);
      await randomSleep(waitTime, waitTime + 5000);

      const responseGameData = startResponse.dailyKeysMiniGames;
      const cipher = createSignature(gameId, config.staticId, responseGameData);

      console.log(`Получаем мини-игру ${gameId}...`);
      const claimResponse = await fetchApi('/claim-daily-keys-minigame', 'POST', {
        miniGameId: gameId,
        cipher: cipher
      }, config.bearerToken);

      if (claimResponse && claimResponse.bonus) {
        console.log(`Мини-игра ${gameId} успешно получена, + ${claimResponse.bonus} ${gameId === 'Candles' ? 'ключей' : 'монет'}`);
      } else {
        console.error(`Не удалось получить мини-игру ${gameId}`);
      }
    }

    console.log('Фаза мини-игр завершена');
  } catch (error) {
    console.error('Ошибка при выполнении мини-игр:', error);
  }
}

module.exports = miniGames;
