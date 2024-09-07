const config = require('./config');
const buyUpgrade = require('./modules/buyUpgrade');
const dailyCipher = require('./modules/dailyCipher');
const tasks = require('./modules/tasks');
const miniGames = require('./modules/miniGames');
const promoCodes = require('./modules/promoCodes');
const buyBoost = require('./modules/buyBoost');
const tap = require('./modules/tap');
const { sleep } = require('./utils/helpers');
const { getRandomInt } = require('./utils/helpers');

async function runModule(moduleName, moduleFunction) {
  if (config[moduleName].enabled) {
    try {
      await moduleFunction(config[moduleName], config.bearerToken);
    } catch (error) {
      console.error(`Ошибка в модуле ${moduleName}:`, error);
    }
    const randomInterval = getRandomInt(config[moduleName].interval, config[moduleName].interval * 2);
    await sleep(randomInterval);
  }
}

async function main() {
  const modules = [
    { name: 'buyUpgrade', func: buyUpgrade },
    { name: 'dailyCipher', func: dailyCipher },
    { name: 'tasks', func: tasks },
    { name: 'miniGames', func: miniGames },
    { name: 'promoCodes', func: promoCodes },
    { name: 'buyBoost', func: buyBoost },
    { name: 'tap', func: tap }
  ];

  const runModules = modules.map(module => {
    return async () => {
      while (true) {
        await runModule(module.name, module.func);
      }
    };
  });

  await Promise.all(runModules.map(run => run()));
}

main().catch(console.error);
