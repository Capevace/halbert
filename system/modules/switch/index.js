const config = require('../../config');
const triggers = require('./triggers');
const actions = require('./actions');
const conditions = require('./conditions');
const accessories = require('./accessories');

module.exports = {
  info: {
    name: 'Switches',
    description: 'Enables you to use switches for lights or remote plugs.',
    id: 'switches',
    author: 'Lukas von Mateffy (@Capevace)',
    type: 'physical',
    usesGPIO: true
  },
  widgetSettings: {
    switchId: {
      type: "string",
      title: 'Switch-ID'
    }
  },
  triggers,
  conditions,
  actions,
  accessories
};

// {
//   id: 1,
//   type: 'remote',
//   states: {
//     on: '01001010011001001',
//     off: '01001010011001111'
//   }
// }
