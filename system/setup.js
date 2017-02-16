const uuid = require('uuid-1345').v4;
const argv = require('yargs').alias('d', 'debug').argv;

// Turn on debug-mode if specified in the command line
global.DEBUG_MODE = !!argv.debug;
console.logger.info(`Debug Mode: ${DEBUG_MODE ? 'ENABLED' : 'DISABLED'}`);

// Create unique session ID
global.SESSION_ID = uuid();
console.logger.info('Session-ID:', SESSION_ID);

// Base Setup
const systemEventEmitter = require('./systemEventEmitter');
const config = require('./config');
const database = require('./database');

// Start Setup
const moduleRegistry = require('./moduleRegistry');

// Setup HTTP Server and Socket Server
const serverSetup = require('./server');
serverSetup(moduleRegistry);
// // Setup Intent System
// const intentParserSetup = require('./intent');
// intentParserSetup(moduleRegistry);
// // Setup Home Kit once initial modules are registered.
// const homeKitSetup = require('./home-kit');
// homeKitSetup(moduleRegistry);
