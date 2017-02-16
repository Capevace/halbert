const express = require('express');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const passport = require('passport');

const config = require('../config');
const { getLocalIP } = require('./network');
const setupPassport = require('./passport');
const setupRoutes = require('./routes');
const setupSockets = require('./sockets');

function setupExpressApp(app) {
  // Enable Handlebars as a view engine
  app.engine('mustache', mustacheExpress());
  app.set('view engine', 'mustache');
  app.set('views', `${__dirname}/views`);

  // Logs out requests (e.g. GET /x.html)
  app.use((req, res, next) => {
    console.logger.info(`${req.method.toUpperCase()} ${req.originalUrl}`);
    next();
  });

  app.use((req, res, next) => {
    // If cache is disabled, clear cache every time (this is slow, so only use in dev)
    if (!config.server.cacheTemplates) {
      app.engines['.mustache'].cache.reset();
    }

    next();
  });

  // Enable use of static public folder
  app.use(express.static(`${__dirname}/public`));

  // Add sessions
  app.use(session({ secret: '20e6f59e-4cdc-4f52-9104-b39b712d29cc' }));

  // Add bodyParser
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  // Add Passport
  app.use(passport.initialize());
  app.use(passport.session());
}

function setupServer(moduleRegistry) {
  const app = express();
  const server = require('http').createServer(app);
  const io = require('socket.io')(server);

  setupPassport();
  setupExpressApp(app);
  setupRoutes(app, moduleRegistry);
  setupSockets(io);

  // Start the server
  server.listen(config.server.port, () => {
    console.logger.success('Halbert-Web-Interface available!');
    console.logger.info(`http://localhost:${config.server.port}`);
    console.logger.info(`http://${getLocalIP()}:${config.server.port}`);
  });
}

module.exports = setupServer;
