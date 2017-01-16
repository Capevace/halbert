const uuid = require('uuid-1345').v4;
const argv = require('yargs')
	.alias('d', 'debug')
	.argv;
const systemEvent = require('./system-event');

// Turn on debug-mode if specified in the command line
global.DEBUG_MODE = !!argv.debug;
console.logger.info(`Debug Mode: ${DEBUG_MODE ? 'ENABLED' : 'DISABLED'}`);

// Create unique session ID
global.SESSION_ID = uuid();
console.logger.info('Session-ID:', SESSION_ID);

// Start Systems
// Config exports the config file as a JS object
const config = require('./config');

// The Module System handles all the modules
const modules = require('./modules');

// The Server handles the web interface and the socket communication
const server = require('./server');

// The Conversation System is responsible for requests to API.ai
// (API.ai handles natural language parsing)
// (rename required and possible switch away from API.ai)
const conversation = require('./conversation');

// The Homekit System handles the communication with Apple's HomeKit.
// It enables you to use Siri or the Home-App to control things in the HALBERT-System
const homekit = require('./home-kit');