const fs = require('fs');
const path = require('path');
const isFunction = require('lodash/isFunction');
const EventEmitter = require('events');

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
let triggerEmitter = new EventEmitter();

function registerModule(moduleDirectory) {
  console.logger.info(`Registering Module '${moduleDirectory}'.`);

  const modulePath = path.resolve(__dirname, moduleDirectory);
  const moduleInfo = loadModuleInfo(modulePath);
  if (!moduleInfo) return;

  moduleInfo.id = moduleDirectory;

  const module = require(path.resolve(modulePath, 'index.js'));

  let moduleBuilder = getModuleBuilder(moduleInfo.id);

  if (isFunction(module))
    module(moduleBuilder);
  else
    return;

  modules[moduleInfo.id] = {
    info: moduleInfo,
    actions: moduleBuilder.actions.actions,
    triggers: moduleBuilder.triggers.triggers,
    routes: moduleBuilder.routes.routes,
    accessories: moduleBuilder.accessories.accessories,
    widgets: moduleBuilder.widgets.widgets
  };

  Object.keys(moduleBuilder.actions.actions)
    .forEach(actionKey => {
      const action = moduleBuilder.actions.actions[actionKey];
      actions[actionKey] = action;
    });

  Object.keys(moduleBuilder.triggers.triggers)
    .forEach(triggerKey => {
      const trigger = moduleBuilder.triggers.triggers[triggerKey];
      triggers[triggerKey] = trigger;
    });

  Object.keys(moduleBuilder.widgets.widgets)
    .forEach(widgetKey => {
      const widget = moduleBuilder.widgets.widgets[widgetKey];
      widgets[widgetKey] = widget;
    });

  moduleBuilder.accessories.accessories
    .forEach(accessoryKey => accessories.push(moduleBuilder.accessories.accessories[accessoryKey]));

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
  },
  runAction(actionKey, ...args) {
    const action = actions[actionKey];

    if (action)
      action.callback(...args);
    else
      console.logger.warn(`The action '${actionKey}' doesn't exist.`);
  },
  emitTrigger(triggerKey, ...args) {
    if (triggers[triggerKey])
      triggerEmitter.emit(triggerKey, ...args);
    else
      console.logger.warn(`The trigger '${triggerKey}' doesn't exist.`);
  }
};

// Install built-in modules first
fs.readdirSync(__dirname)
  .filter(result => fs.statSync(path.resolve(__dirname, result)).isDirectory())
  .forEach(directory => registerModule(directory));
