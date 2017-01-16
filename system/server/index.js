const path = require('path');
const get = require('lodash/get');
const chalk = require('chalk');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');

module.exports = {
  io,
  app
};

const config = require('../config');
const database = require('../database');
const { getLocalIP } = require('./network');
const { getRegisteredModules, getRegisteredModule } = require('../modules');
const { setupSockets } = require('./socket');
const { renderWidgetTemplates, getWidgets } = require('./widgets');
const authentication = require('./authentication');
const refreshDashboards = () => io.emit('dashboard-refresh', {});

app.engine('handlebars', expressHandlebars({ defaultLayout: path.resolve(__dirname, 'views/layouts/main') }));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// Logs out requests (e.g. GET /x.html)
app.use((req, res, next) => {
  console.logger.info(`${req.method.toUpperCase()} ${req.originalUrl}`);
  next();
});
app.use(express.static(__dirname + '/public'));
app.use(session({ secret: '20e6f59e-4cdc-4f52-9104-b39b712d29cc' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

// Renders the dashboard
app.get('/', (req, res, next) => {
  console.log('getem')
  if (req.isAuthenticated()) {
    console.log('is auth', next);
    next();
    return;
  }
  console.log('fak', req.isAuthenticated())
  // if they aren't redirect them to the home page
  res.redirect('/login');
}, (req, res) => {
  console.log('got here');
  res.render('dashboard', {
    layout: false,
    widgetTemplates: renderWidgetTemplates(),
    widgetList: JSON.stringify(getWidgets())
  });
});

app.get('/login', (req, res) => {
  res.render('login', { layout: false });
});

app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/login',
}));

app.get('/modules', (req, res) => {
  const modules = getRegisteredModules();
  res.render('modules', {
    modules: Object.keys(modules).map(id => modules[id].info),
  });
});

app.get('/modules/:id', (req, res) => {
  const id = req.params.id;
  const modules = getRegisteredModules();
  const module = modules[id];

  if (module) {
    res.render('module', {
      module: module
    });
  } else {
    res.sendStatus(404);
    console.logger.info(`Didn\'t find module with id '${module.info.id}'.`);
  }
});

app.post('/modules/:id', (req, res) => {
  const module = getRegisteredModule(req.params.id);

  if (!module) res.sendStatus(404);

  Object.keys(req.body)
    .forEach(key => {
      // Get sanitize function
      const sanitize = get(module.sanitizeSettings, key);

      // If sanitize function exists, sanitize, otherwise dont
      const value = (sanitize) ? sanitize(req.body[key]) : req.body[key];

      // Set value add specific key in database
      database
        .get('modules')
        .set(`${req.params.id}.${key}`, value)
        .value();
    });

  console.logger.info(`Changed settings for '${module.info.id}'.`);

  // Refresh Dashboards to update settings properly
  refreshDashboards();

  res.redirect('back');
});

app.get('/halbert', (req, res) => {
  res.render('halbert', { layout: false });
});

app.get('/homescreen', (req, res) => res.render('homescreen', { layout: false }));

const modules = getRegisteredModules();
Object.keys(modules)
  .forEach(moduleKey => {
    const module = modules[moduleKey];
    if (module.routes) {
      module.routes(app);
      console.logger.info(`Added routes for module '${module.info.id}'.`);
    }
  })

setupSockets(io);

server.listen(config.server.port, () => {
  console.logger.success('Halbert-Interface available!');
  console.logger.info(`http://localhost:${config.server.port}`);
  console.logger.info(`http://${getLocalIP()}:${config.server.port}`);
});

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
      console.log('is auth');
      next();
      return;
    }
    // if they aren't redirect them to the home page
    res.redirect('/login');
}
