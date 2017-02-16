const ApiAI = require('apiai');
const app = ApiAI('1d055286e299446db31cd7c9fc5a0eab');
const { hasTrigger, runTrigger } = require('./modules');
const { say } = require('./voice');

function sendRequest(input) {
  console.logger.info(`Sending request to API.AI: '${input}'`);
  const request = app.textRequest(input, {
    sessionId: 'session'
  });

  request.on('response', response => {
    console.logger.info(`Received API.AI-Trigger: '${response.result.action}'`);

    if (
      response.result &&
        response.result.action &&
        hasTrigger(response.result.action)
    ) {
      runTrigger(response.result);
    } else {
      say("I'm sorry, but I didn't quite understand that.");
    }
  });

  request.on('error', error => {
    console.logger.error(error);
    say("I'm sorry, but an error occurred to me.");
  });

  request.end();
}

module.exports = {
  sendRequest
};
