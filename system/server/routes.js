const passport = require('passport');
const jwt = require('jsonwebtoken');
const values = require('lodash/values');

const database = require('../database');
const { renderWidgetTemplates, getWidgets } = require('./widgets');
const {
  getRegisteredModules,
  getRegisteredModule,
  getTriggers,
  getActions,
  getWidget
} = require('../modules');

module.exports = app => {
  /*
  *  The Route for the main Dashboard.
  */
  app.get('/', isLoggedIn, (req, res) => {
    // Expires in a year (temp)
    const token = jwt.sign(req.user, 'mysecret', { expiresIn: '5h' });

    res.render('dashboard', {
      token,
      layout: false,
      widgetTemplates: renderWidgetTemplates(),
      widgetList: JSON.stringify(getWidgets())
    });
  });

  /*
  *  Login Page
  */
  app.get('/login', (req, res) => {
    res.render('login');
  });

  /*
  *  Login request
  */
  app.post(
    '/login',
    passport.authenticate('local-login', {
      successRedirect: '/',
      failureRedirect: '/login'
    })
  );

  /*
  *  The Route for HAL-view.
  */
  app.get('/halbert', (req, res) => {
    res.render('halbert', { layout: false });
  });

  /*
  *  The home screen is a WIP screen for smaller display.
  *  To be used by things like "home-stations".
  */
  app.get('/homescreen', (req, res) =>
    res.render('homescreen', { layout: false }));

  app.get('/modules/triggers', (req, res) => {
    // Triggers are stored in key-value object => convert to array
    res.status(200).json(values(getTriggers()));
  });

  app.get('/modules/:id/triggers', (req, res) => {
    const module = getRegisteredModule(req.params.id);

    module
      ? res.status(200).json(values(module.triggers))
      : res.status(404).json({
          status: 404,
          message: `The module ${req.params.id} was not found.`
        });
  });

  app.get('/widgets/:id/data', (req, res) => {
    const widgetEntry = database.get('widgets').find({ id: req.params.id });
    const widget = getWidget(widgetEntry.component);
    res.json(widget.onDataRequest(widgetEntry.settings));
  });

  /*
  *  Register the routes exported by the modules
  */
  const modules = getRegisteredModules();
  Object.keys(modules).forEach(moduleKey => {
    const module = modules[moduleKey];
    module.routes.forEach(route => {
      switch (route.method.toLowerCase()) {
        case 'get':
          app.get(route.route, ...route.args);
          break;
        case 'post':
          app.post(route.route, ...route.args);
          break;
        case 'patch':
          app.patch(route.route, ...route.args);
          break;
        case 'put':
          app.put(route.route, ...route.args);
          break;
        default:
          console.logger.error(
            `Method '${route.method}' at module '${route.moduleId}' is unknown.`
          );
      }
    });
  });
};

/*
*  LoggedIn helper function
*/
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
    return;
  }

  // Arent logged in, send to login
  res.redirect('/login');
}
