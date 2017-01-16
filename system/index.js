if (!global.CONFIG_PATH) global.CONFIG_PATH = '../halbert.config.json';
if (!global.MODULES_PATH) global.MODULES_PATH = __dirname + '/modules';

// Install custom logging functions
require('./log');

console.logger.info('Setting up H.A.L.B.E.R.T....');

// Start Setup
require('./setup');

// At this point, the project is running

console.logger.info('Setup complete!');
