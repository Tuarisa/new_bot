function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomSleep(min, max) {
  const sleepTime = Math.floor(Math.random() * (max - min + 1)) + min;
  return sleep(sleepTime);
}

function atob(base64String) {
  return Buffer.from(base64String, 'base64').toString('binary');
}

module.exports = { sleep, randomSleep, atob };
