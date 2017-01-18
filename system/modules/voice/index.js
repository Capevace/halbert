const triggerListeners = require('./triggerListeners');
const actions = require('./actions');

module.exports = {
  info: {
    name: 'Voice',
    description: 'Voice Control',
    id: 'voice',
    author: 'Lukas von Mateffy (@Capevace)',
    type: 'virtual'
  },
  actions,
  triggerListeners,
  triggers: {
    'voice-input.parsed': {
      name: 'Voice Input finished parsing with API.ai',
      sentence: 'voice input finished parsing'
    }
  }
};
