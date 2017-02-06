const apiai = require('apiai');
const app = apiai('1d055286e299446db31cd7c9fc5a0eab');
const { emitTrigger, runAction } = require('../../modules');

module.exports = builder => {
  builder.widgets
    .createWidget('Voice Recognizer', 'voice', 'widget.html');

  builder.triggers
    .createTrigger('voice-input.parsed')
    .setMeta('Voice Input parsed', 'voice input parsed')
    .addArgument('input', 'string');

  builder.triggers
    .listen('microphone.input', data => runAction('voice-input.parse', data.input))
    .listen('voice-input.parsed', data => runAction(data.result.action, data.result.parameters));

  builder.actions
    .createAction('voice-input.parse')
    .setMeta('Parse voice input', 'parse the voice input')
    .addArgument('input', 'string')
    .setCallback(data => {
      const request = app.textRequest(data.input, {
        sessionId: SESSION_ID
      });

      request.on('response', function(response) {
        console.log(response);
        if (response.result && response.result.action) {

          if (DEBUG_MODE) {
            console.logger.info(`API.ai query for '${data.input}' got`, response.result);
          } else {
            console.logger.info(`API.ai query for '${data.input}'.`);
          }

          emitTrigger('voice-input.parsed', {
            result: response.result
          });
        } else {
          console.logger.info('Error with API.ai', response);
        }
      });

      request.on('error', function(error) {
        console.logger.error(error);
      });

      request.end();
    });
};
