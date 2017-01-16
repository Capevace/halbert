const passport = require('passport');
const jwt = require('jsonwebtoken');

const { renderWidgetTemplates, getWidgets } = require('./widgets');
const { getRegisteredModules } = require('../modules');

module.exports = (app) => {
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
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
  }));

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
  app.get('/homescreen', (req, res) => res.render('homescreen', { layout: false }));

  /*
   *  Register the routes exported by the modules
   */
  const modules = getRegisteredModules();
  Object.keys(modules)
    .forEach(moduleKey => {
      const module = modules[moduleKey];
      if (module.routes) {
        module.routes(app);
        console.logger.info(`Added routes for module '${module.info.id}'.`);
      }
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
