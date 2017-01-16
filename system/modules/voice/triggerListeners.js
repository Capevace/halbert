const { runAction } = require('../modules');

module.exports = {
  'microphone.input': data => runAction('voice-input.parse', data.input),
  'voice-input.parsed': data => runAction(data.result.action, data.result.parameters)
};
