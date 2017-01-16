const triggers = require('./triggers');
const actions = require('./actions');
const conditions = require('./conditions');
const routes = require('./routes');

module.exports = {
  info: {
      name: 'Music',
      description: 'Does music stuff',
      id: 'music',
      author: 'Lukas von Mateffy (@Capevace)',
      type: 'virtual'
  },
  widgetSettings: {
    switchId: {
      type: 'string',
    },
  },
  triggers,
  conditions,
  actions,
  routes
};
