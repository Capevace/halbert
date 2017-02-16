const values = require('lodash/values');

let moduleRegistry = {};

function getAllTriggers(req, res) {
  // Triggers are stored in key-value object => convert to array
  res.status(200).json(values(moduleRegistry.getTriggers()));
}

function getTriggersForModule(req, res) {
  const module = moduleRegistry.getRegisteredModule(req.params.id);

  module
    ? res.status(200).json(values(module.triggers))
    : res.status(404).json({
      status: 404,
      message: `The module ${req.params.id} was not found.`
    });
}

// Not sure this belongs in here but it's a good place for now
function registerRoutesForModules(app) {
  const modules = moduleRegistry.getRegisteredModules();
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
}

function setup(newModuleRegistry) {
  moduleRegistry = newModuleRegistry;
}

module.exports = {
  getAllTriggers,
  getTriggersForModule,
  registerRoutesForModules,
  setup
};
