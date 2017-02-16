const passport = require('passport');
const {
  moduleController,
  uiController,
  widgetController
} = require('./controllers');

function setupRoutes(app, moduleRegistry) {
  app.get('/', requireAuth, uiController.renderDashboard);
  app.get('/login', uiController.renderLogin);
  app.get('/halbert', uiController.renderHalbert);
  app.get('/homescreen', uiController.renderHomescreen);

  // Login request
  app.post(
    '/login',
    passport.authenticate('local-login', {
      successRedirect: '/',
      failureRedirect: '/login'
    })
  );

  app.get('/widgets/:id/data', widgetController.getDataForWidget);

  moduleController.setup(moduleRegistry);
  app.get('/modules/triggers', requireAuth, moduleController.getAllTriggers);
  app.get(
    '/modules/:id/triggers',
    requireAuth,
    moduleController.getTriggersForModule
  );
  moduleController.registerRoutesForModules(app);
}

/*
*  LoggedIn helper function
*/
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
    return;
  }

  // Arent logged in, send to login
  res.redirect('/login');
}

module.exports = setupRoutes;
