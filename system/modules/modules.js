const fs = require('fs');
const path = require('path');
const {
  TriggerBuilder,
  ActionBuilder,
  RoutesBuilder,
  AccessoryBuilder,
  WidgetBuilder
} = require('./builders');

let modules = {};
let actions = {};
let triggers = {};
let accessories = [];
let widgets = {};

function registerModule(moduleDirectory) {
  console.logger.info(`Registering Module '${moduleDirectory}'.`);

  const modulePath = path.resolve(__dirname + '/m', moduleDirectory);
  const moduleInfo = loadModuleInfo(modulePath);
  if (!moduleInfo) return;

  moduleInfo.id = moduleDirectory;

  const module = require(path.resolve(modulePath, 'index.js'));

  let moduleBuilder = getModuleBuilder(moduleInfo.id);
  module(moduleBuilder);

  modules[moduleInfo.id] = {
    info: moduleInfo,
    actions: moduleBuilder.actions.actions,
    triggers: moduleBuilder.triggers.triggers,
    routes: moduleBuilder.routes.routes,
    accessories: moduleBuilder.accessories.accessories,
    widgets: moduleBuilder.widgets.widgets
  };

  Object.keys(moduleBuilder.actions.actions)
    .forEach(action => actions[action.id] = action);

  Object.keys(moduleBuilder.triggers.triggers)
    .forEach(trigger => triggers[trigger.id] = trigger);

  Object.keys(moduleBuilder.widgets.widgets)
    .forEach(widget => widgets[widget.id] = widget);

  moduleBuilder.accessories.accessories
    .forEach(accessory => accessories.push(accessory));

  console.logger.success(`Registered Module '${moduleDirectory}'.`);
}

function getModuleBuilder(moduleId) {
  const moduleBuilder = {
    triggers: new TriggerBuilder(moduleId),
    actions: new ActionBuilder(moduleId),
    routes: new RoutesBuilder(moduleId),
    accessories: new AccessoryBuilder(moduleId),
    widgets: new WidgetBuilder(moduleId),
  };

  return moduleBuilder;
}


function loadModuleInfo(modulePath) {
  const infoPath = path.resolve(modulePath, 'module.json');

  if (!fs.existsSync(infoPath)) {
    console.logger.error('No module.json file for module at /' + modulePath);
    return null;
  }

  const infoContent = fs.readFileSync(infoPath, 'utf8');

  try {
    const infoObject = JSON.parse(infoContent);
    return infoObject;
  } catch (err) {
    console.logger.error(`Parsing module.json from module at '/${modulePath} failed.'`, err);
    return null;
  }
}

module.exports = {
  getRegisteredModules() {
    return modules;
  },
  getRegisteredModule(id) {
    return modules[id];
  },
  getWidgets() {
    return widgets;
  }
};

// Install built-in modules first
fs.readdirSync(__dirname + '/m')
  .filter(result => fs.statSync(path.resolve(__dirname + '/m', result)).isDirectory())
  .forEach(directory => registerModule(directory));
