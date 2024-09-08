module.exports = {
  bearerToken: '17227....',
  buyUpgrade: {
    enabled: true,
    interval: 5 * 60,
    maxPayback: 10200
  },
  dailyCipher: {
    enabled: false,
    interval: 60 * 60
  },
  tasks: {
    enabled: true,
    interval: 60 * 60
  },
  miniGames: {
    enabled: true,
    interval: 15 * 60,
    supportedGames: ['Tiles', 'Candles'],
    staticId: ''
  },
  promoCodes: {
    enabled: true,
    interval: 10 * 60,
    rewardType: ['keys', 'coins'],
    maxKeys: 8
  },
  buyBoost: {
    enabled: false,
    interval: 60 * 60
  },
  tap: {
    enabled: false,
    interval: 60,
    minTaps: 10,
    maxTaps: 50
  }
};
