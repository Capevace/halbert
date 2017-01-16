const config = require('../../config');
const { post } = require('axios');
const uuid = require('uuid-1345').v4;

if (!config.modules.ifttt.webhookSecret) {
  console.logger.warn('No webhook secret defined! Webhooks will not work! Please configure a secret or use the one below.');
  console.logger.info(`Generated webhook secret '${uuid()}'`);
}

module.exports = {
  info: {
    name: 'IFTTT',
    description: 'Enables the use of IFTTT Triggers.',
    id: 'ifttt',
    author: 'Lukas von Mateffy (@Capevace)',
    type: 'virtual'
  },
  triggers: {
    'ifttt.webhook': {
    	name: 'IFTTT triggered a webhoook',
    	sentence: 'IFTTT triggered a webhook',
    }
  },
  actions: {
    'ifttt.request-event': {
      name: 'Set Switch to on',
      sentence: 'set a switch to on',
      arguments: {
        name: {
          type: 'string',
        },
        value1: {
          type: 'string',
        },
        value2: {
          type: 'string',
        },
        value3: {
          type: 'string',
        },
      },
      callback: data => {
        if (!config.modules.ifttt || !config.modules.ifttt.apiKey) {
          console.logger.error('Unable to send an event request to IFTTT. No API Key given.');
          return;
        }

        if (!data.name) {
          console.logger.error('Unable to send an event request to IFTTT. No event name given.');
          return;
        }

        const url = `https://maker.ifttt.com/trigger/${data.name}/with/key/${config.modules.ifttt.apiKey}`;
        post(url, {
          value1: data.value1,
          value2: data.value2,
          value3: data.value3
        })
          .then(function (response) {
            if (response.status !== 200) {
              console.logger.warn('Status code of IFTTT is not 200.', response);
            } else {
              console.logger.info(`IFTTT event '${data.name}' was triggered.`);
            }
          })
          .catch(function (error) {
            console.logger.error(`Error triggering IFTTT event '${data.name}'.`, error);
          });
      }
    },
  },
  routes: app => {
    if (config.modules.ifttt.webhookSecret) {
      app.post('/ifttt/webhook', (req, res) => {
        const webhookSecret = req.query.key;

        if (webhookSecret !== config.modules.ifttt.webhookSecret) {
          res.sendStatus(401);
          return;
        }

        console.log(req.body);
        res.sendStatus(200);
      });
    }
  }
};
