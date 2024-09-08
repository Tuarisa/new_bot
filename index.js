const config = require('./config');
const buyUpgrade = require('./modules/buyUpgrade');
const dailyCipher = require('./modules/dailyCipher');
const tasks = require('./modules/tasks');
const miniGames = require('./modules/miniGames');
const promoCodes = require('./modules/promoCodes');
const buyBoost = require('./modules/buyBoost');
const tap = require('./modules/tap');
const { randomSleep } = require('./utils/helpers');

async function runModule(moduleName, moduleFunction) {
    if (config[moduleName].enabled) {
        try {
            await randomSleep(1 * 1000, 10 * 1000);
            console.log(`Запускаем модуль ${moduleName}`);
            await moduleFunction(config[moduleName], config.bearerToken);
        } catch (error) {
            console.error(`Ошибка в модуле ${moduleName}:`, error);
        }
        await randomSleep(config[moduleName].interval * 1000, config[moduleName].interval * 2 * 1000);
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

    const runModules = modules
        .filter(module => config[module.name].enabled)
        .map(module => {
            return async () => {
                while (true) {
                    await runModule(module.name, module.func);
                }
            };
        });

    await Promise.all(runModules.map(run => run()));
}

main().catch(console.error);
