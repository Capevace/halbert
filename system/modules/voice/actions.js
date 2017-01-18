const { emitTrigger } = require('../modules');
const apiai = require('apiai');
const app = apiai('1d055286e299446db31cd7c9fc5a0eab');

module.exports = {
  'voice-input.parse': {
    name: 'Parse voice input',
    sentence: 'parse the voice input',
    callback: data => {
      const request = app.textRequest(data.input, {
        sessionId: `${SESSION_ID}.${Math.round(Math.random() * 9999)}`
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
    }
  }
};
