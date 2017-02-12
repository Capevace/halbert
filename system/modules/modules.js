const fs = require('fs');
const path = require('path');
const isFunction = require('lodash/isFunction');
const EventEmitter = require('events');

const {
  TriggerBuilder,
  ActionBuilder,
  RouteBuilder,
  AccessoryBuilder,
  WidgetBuilder
} = require('./builders');
const stateBuilder = require('./state').state;
const database = require('../database');

const modules = {};
const actions = {};
const triggers = {};
const accessories = [];
const widgets = {};
const triggerEmitter = new EventEmitter();
const builtinPath = path.resolve(__dirname, 'built-in');

// Extend builders with getters for module state
TriggerBuilder.prototype.getTriggers = () => triggers;
ActionBuilder.prototype.getActions = () => actions;
AccessoryBuilder.prototype.getAccessories = () => accessories;
WidgetBuilder.prototype.getWidgets = () => widgets;

function registerModule(moduleDirectory) {
  console.logger.info(`Registering Module '${moduleDirectory}'.`);

  const modulePath = path.resolve(builtinPath, moduleDirectory);
  const moduleInfo = loadModuleInfo(modulePath);
  if (!moduleInfo) return;

  moduleInfo.id = moduleDirectory;

  const module = require(path.resolve(modulePath, 'index.js'));

  const moduleBuilder = getModuleBuilder(moduleInfo.id);

  if (isFunction(module)) module(moduleBuilder);
  else return;

  modules[moduleInfo.id] = {
    info: moduleInfo,
    actions: moduleBuilder.actions.actions,
    triggers: moduleBuilder.triggers.triggers,
    routes: moduleBuilder.routes.routes,
    accessories: moduleBuilder.accessories.accessories,
    widgets: moduleBuilder.widgets.widgets
  };

  Object.keys(moduleBuilder.actions.actions).forEach(actionKey => {
    const action = moduleBuilder.actions.actions[actionKey];
    actions[actionKey] = action;
  });

  Object.keys(moduleBuilder.triggers.triggers).forEach(triggerKey => {
    const trigger = moduleBuilder.triggers.triggers[triggerKey];
    triggers[triggerKey] = trigger;
  });

  Object.keys(moduleBuilder.widgets.widgets).forEach(widgetKey => {
    const widget = moduleBuilder.widgets.widgets[widgetKey];
    widgets[widgetKey] = widget;
  });

  moduleBuilder.accessories.accessories.forEach(
    accessoryKey =>
      accessories.push(moduleBuilder.accessories.accessories[accessoryKey])
  );

  console.logger.success(`Registered Module '${moduleDirectory}'.`);
}

function getModuleBuilder(moduleId) {
  const state = stateBuilder(moduleId);

  const moduleBuilder = {
    triggers: new TriggerBuilder(moduleId, trigger =>
      triggerEmitter.on(trigger.id, trigger.callback)),
    actions: new ActionBuilder(moduleId),
    routes: new RouteBuilder(moduleId),
    accessories: new AccessoryBuilder(moduleId),
    widgets: new WidgetBuilder(moduleId),
    state,
    database: database.get('modules').get(moduleId),
    runAction,
    emitTrigger
  };

  return moduleBuilder;
}

function loadModuleInfo(modulePath) {
  const infoPath = path.resolve(modulePath, 'module.json');
  if (!fs.existsSync(infoPath)) {
    console.logger.error(`No module.json file for module at ${modulePath}`);
    return null;
  }

  const infoContent = fs.readFileSync(infoPath, 'utf8');

  try {
    const infoObject = JSON.parse(infoContent);
    return infoObject;
  } catch (err) {
    console.logger.error(
      `Parsing module.json from module at '/${modulePath} failed.'`,
      err
    );
    return null;
  }
}

function runAction(actionKey, input) {
  const action = actions[actionKey];

  if (action) action.callback(input);
  else console.logger.warn(`The action '${actionKey}' doesn't exist.`);
}

function emitTrigger(triggerKey, output) {
  if (triggers[triggerKey]) triggerEmitter.emit(triggerKey, output);
  else console.logger.warn(`The trigger '${triggerKey}' doesn't exist.`);
}

module.exports = {
  getRegisteredModules() {
    return modules;
  },
  getRegisteredModule(id) {
    return modules[id];
  },
  getTriggers() {
    return triggers;
  },
  getActions() {
    return actions;
  },
  getWidgets() {
    return widgets;
  },
  getWidget(key) {
    console.log(widgets[key]);
    return widgets[key];
  },
  runAction,
  emitTrigger
};

// Install built-in modules first
fs
  .readdirSync(builtinPath)
  .filter(result =>
    fs.statSync(path.resolve(builtinPath, result)).isDirectory())
  .forEach(directory => registerModule(directory));
