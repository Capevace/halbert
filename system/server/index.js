const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const passport = require('passport');
const socketioJwt = require('socketio-jwt');


require('./authentication');
const config = require('../config');
const { getLocalIP } = require('./network');
const { setupSockets } = require('./socket');
const routes = require('./routes');

module.exports = {
  io,
  app
};

// Enable Handlebars as a view engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', `${__dirname  }/views`);

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
app.use(express.static(`${__dirname  }/public`));

// Add sessions
app.use(session({ secret: '20e6f59e-4cdc-4f52-9104-b39b712d29cc' }));

// Add bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Add Passport
app.use(passport.initialize());
app.use(passport.session());

io.set('authorization', socketioJwt.authorize({
  secret: 'mysecret',
  handshake: true
}));

// Setup Express-Routes
routes(app);

// Setup Socket.io-Handling
setupSockets(io);

// Start the server
server.listen(config.server.port, () => {
  console.logger.success('Halbert-Web-Interface available!');
  console.logger.info(`http://localhost:${config.server.port}`);
  console.logger.info(`http://${getLocalIP()}:${config.server.port}`);
});
