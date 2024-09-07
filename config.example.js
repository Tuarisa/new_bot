module.exports = {
  bearerToken: 'Bearer ',
  buyUpgrade: {
    enabled: true,
    interval: 300000, // 5 минут
    maxPayback: 10000
  },
  dailyCipher: {
    enabled: true,
    interval: 3600000 // 1 час
  },
  tasks: {
    enabled: true,
    interval: 1800000 // 30 минут
  },
  miniGames: {
    enabled: true,
    interval: 3600000 // 1 час
  },
  promoCodes: {
    enabled: true,
    interval: 7200000 // 2 часа
  },
  buyBoost: {
    enabled: true,
    interval: 600000 // 10 минут
  },
  tap: {
    enabled: true,
    interval: 30000, // 30 секунд
    minTaps: 10,
    maxTaps: 50
  }
};
