const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const config = require('../config');
const database = require('../database');

const cacheTemplates = config.server.cacheTemplates;
const triggerEmitter = new EventEmitter();
const registeredTriggers = {};
const registeredConditions = {};
const registeredActions = {};
const registeredTemplates = {};
const registeredModules = {};

// Registers a module by adding its triggers, conditions and actions (see docs)
function registerModule(module, directory) {
  if (!module.info || (module.info && (!module.info.name || !module.info.id))) {
    console.logger.error(`The module in the '${directory}' folder didn't provide any or not enough info. Ignoring the module.`);
    return;
  }

  if (registeredModules[module.info.id]) {
    console.logger.error(`The module '${module.info.id}' already exists. Skipping...`);
    return;
  }

  console.logger.info(`Registering module '${module.info.id}'...`);

  registeredModules[module.info.id] = module;

  // Go through default settings and check, what's needed to be added
  // to current settings (by using Object.assign)
  if (module.defaultSettings) {
    const oldSettings =
      database
        .get('modules')
        .get(module.info.id)
        .value();

    database
      .get('modules')
      .set(
        module.info.id,
        Object.assign(module.defaultSettings || {}, oldSettings)
      )
      .value();
  } else {
    database
      .get('modules')
      .set(module.info.id, {})
      .value();
  }

  // Register all the triggers that the module exports
  if (module.triggers) {
    Object.keys(module.triggers)
      .forEach(trigger => registerTrigger(trigger, module));
  }

  // Add all triggerListeners to the trigger emitter
  // the event function then checks, if the module is active
  // and then executes the trigger
  if (module.triggerListeners) {
    Object.keys(module.triggerListeners)
      .forEach(trigger => registerTriggerListener(trigger, module));
  }

  // Add all the conditions available,
  // but only those, that don't already exist
  if (module.conditions) {
    Object.keys(module.conditions)
      .forEach(condition => registerCondition(condition, module));
  }

  // Add all the conditions available,
  // but only those, that don't already exist
  if (module.actions) {
    Object.keys(module.actions)
      .forEach(action => registerAction(action, module));
  }

  registerTemplate(module, directory);

  // Execute boot function of module
  if (module.boot) {
    module.boot.call(module, triggerEmitter);
  }

  console.logger.success(`Registered module '${module.info.id}'.`);
}

// Adds a listener from modules for triggers
function registerTriggerListener(trigger, module) {
  triggerEmitter.on(trigger, triggerData => {
    if (isModuleActive(trigger)) {
      module.triggerListeners[trigger].call(null, triggerData);
    } else {
      console.logger.info(`Ignoring trigger '${trigger}' for module '${module.info.id}'.`);
    }
  });

  console.logger.success(`Module '${module.info.id}' is listening to '${trigger}'.`);
}

// Registers a trigger for a given module
function registerTrigger(trigger, module) {
  if (registeredTriggers[trigger]) {
    console.logger.error(`Trigger '${trigger} from '${module.info.id}' already exists.`);
  }

  registeredTriggers[trigger] = module.triggers[trigger];
  console.logger.success(`Module '${module.info.id}' registered trigger '${trigger}'.`);
}

// Registers a condition for a given module
function registerCondition(condition, module) {
  if (registeredConditions[condition]) {
    console.logger.error(`Condition '${condition}' in '${module.info.id}' already exists.`);
    return;
  };

  registeredConditions[condition] = module.conditions[condition];
  console.logger.success(`Condition '${condition}' was registered.`);
}

// Registers an action for a given module
function registerAction(action, module) {
  if (registeredActions[action]) {
    console.logger.error(`Action '${action}' in '${module.info.id}' already exists.`);
    return;
  };

  registeredActions[action] = module.actions[action];
  console.logger.success(`Action '${action}' was registered.`);
}

function registerTemplate(module, directory) {
  const templatePath = path.resolve(__dirname, directory, 'widget.html');
  if (fs.existsSync(templatePath)) {
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    if (cacheTemplates) {
      registeredTemplates[module.info.id] = templateContent;
    } else {
      registeredTemplates[module.info.id] = templatePath;
    }

    console.logger.success(`Template for module ${module.info.id} registered.`);
  }
}

function hasTrigger(triggerName) {
  return triggerEmitter.listenerCount(triggerName) > 0;
}

function hasCondition(condition) {
  return !!registeredConditions[condition];
}

function hasAction(action) {
  return !!registeredActions[action];
}

// Checks, wether a module is enabled (active) or disabled (inactive)
function isModuleActive() {
  // Temp: check if modules have been activated
  return true;
}

// Emits an event on the event trigger, executing all registered trigger handlers
function emitTrigger(event, data) {
  triggerEmitter.emit(event, data);
}

// Runs a condition function and returns the result
function checkCondition(condition) {
  if (!registeredConditions[condition]) {
    console.warn(`Tried to check condition, that doesn't exist. (${condition})`);
    return false;
  }

  return registeredConditions[condition]();
}

// Runs a given action
function runAction(action, data) {
  if (!registeredActions[action]) {
    console.logger.error(`The action '${action}' doesn't exist.`);
    return false;
  } else if (!registeredActions[action].callback) {
    console.logger.error(`The action'${action} doesn't provide a callback.`);
    return false;
  }

  return registeredActions[action].callback(data);
}

function getTemplates() {
  if (!cacheTemplates) {
    const renderedTemplates = {};
    for (const templateKey in registeredTemplates) {
      const path = registeredTemplates[templateKey];
      renderedTemplates[templateKey] = fs.readFileSync(path, 'utf8');
    }

    return renderedTemplates;
  }

  return registeredTemplates;
}

function getRegisteredModules() {
  return registeredModules;
}

function getRegisteredModule(id) {
  return registeredModules[id];
}

module.exports = {
  registerModule,
  hasTrigger,
  hasCondition,
  hasAction,
  isModuleActive,
  emitTrigger,
  runAction,
  checkCondition,
  getTemplates,
  getRegisteredModules,
  getRegisteredModule
};

// Read all folders from modules folder
// then filter these to get only directories
// then register the module
console.logger.info('Begin registering modules');
console.logger.info('Template Cache:', cacheTemplates ? 'ENABLED' : 'DISABLED');

// Install built-in modules first
fs.readdirSync(__dirname)
  .filter(result => fs.statSync(path.resolve(__dirname, result)).isDirectory())
  .forEach(directory => registerModule(require(path.resolve(__dirname, directory)), directory));

// Check if the modules path is the current path to remove duplicates in dev mode
if (path.resolve(__dirname) !== path.resolve(MODULES_PATH)) {
  // Install user-modules after
  fs.readdirSync(MODULES_PATH)
    .filter(result => fs.statSync(path.resolve(__dirname, result)).isDirectory())
    .forEach(directory => registerModule(require(path.resolve(__dirname, directory)), directory));
}
