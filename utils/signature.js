const crypto = require('crypto');

function createSignature(gameId, staticId, gameData) {
  const startDate = new Date(gameData.startDate);
  const remainPoints = gameData.remainPoints;
  const maxMultiplier = Math.min(45, 100) / 100;
  const number = Math.floor(startDate.getTime() / 1000);
  const numberLen = number.toString().length;
  const index = (number % (numberLen - 2)) + 1;

  let res = '';
  for (let i = 1; i <= numberLen; i++) {
    res += i === index ? '0' : Math.floor(Math.random() * 10).toString();
  }

  const scorePerGame = {
    Candles: 0,
    Tiles: remainPoints > 300 
      ? Math.floor(Math.random() * (remainPoints * maxMultiplier - remainPoints * 0.01 + 1)) + Math.floor(remainPoints * 0.01)
      : remainPoints
  };

  const scoreCipher = 2 * (number + scorePerGame[gameId]);
  const dataString = [
    res,
    staticId,
    gameId,
    scoreCipher.toString(),
    Buffer.from(crypto.createHash('sha256').update(`R1cHard_AnA1${scoreCipher}G1ve_Me_y0u7_Pa55w0rD`).digest()).toString('base64')
  ].join('|');

  return Buffer.from(dataString).toString('base64');
}

module.exports = { createSignature };
