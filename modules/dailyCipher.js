const { fetchApi } = require('../utils/api');
const { atob } = require('../utils/helpers');

async function dailyCipher(config, bearerToken) {
  try {
    // Получаем конфигурацию
    const configResponse = await fetchApi('/config', 'POST', null, bearerToken);

    // Проверяем, не получен ли уже ежедневный шифр
    if (!configResponse.dailyCipher.isClaimed) {
      console.log('Начинаем разгадывать шифр Морзе...');
      const cipher = configResponse.dailyCipher.cipher;
      const decodedCipher = `${cipher.slice(0, 3)}${cipher.slice(4)}`;
      
      // Расшифровываем код и отправляем запрос на получение награды
      const claimResponse = await fetchApi('/claim-daily-cipher', 'POST', {
        cipher: atob(decodedCipher)
      }, bearerToken);

      console.log('Результат разгадывания шифра:', claimResponse);
      return claimResponse;
    } else {
      console.log('Ежедневный шифр уже получен.');
      return null;
    }
  } catch (error) {
    console.error('Ошибка при разгадывании ежедневного шифра:', error);
    return null;
  }
}

module.exports = dailyCipher;
