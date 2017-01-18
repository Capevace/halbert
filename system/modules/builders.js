const { Accessory, Service, Characteristic } = require('hap-nodejs');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid-1345');
const isFunction = require('lodash/isFunction');
const { server } = require('../config');

// The TriggerBuilder class is a utility to create triggers.
// The good thing about it is, that it's chainable.
class TriggerBuilder {
  constructor(moduleId) {
    this.moduleId = moduleId;
    this.currentTriggerId = null;
    this.triggers = {};
  }

  createTrigger(triggerIdentifier) {
    // Create trigger
    this.triggers[triggerIdentifier] = {
      moduleId: this.moduleId,
      id: triggerIdentifier,
      name: triggerIdentifier,
      sentence: triggerIdentifier,
      arguments: {}
    };

    // Save id for chaining
    this.currentTriggerId = triggerIdentifier;

    console.logger.success(`Created trigger '${triggerIdentifier}'.`);

    return this;
  }

  setMeta(name, sentence) {
    Object.assign(this.triggers[this.currentTriggerId], {
      name: name || this.currentTriggerId,
      sentence: sentence || this.currentTriggerId
    });

    return this;
  }

  addArgument(name, type) {
    this.triggers[this.currentTriggerId]
      .arguments[name] = {
        type
      };

    return this;
  }
}


// The ActionBuilder class is a utility to create actions.
// The good thing about it is, that it's chainable.
class ActionBuilder {
  constructor(moduleId) {
    this.moduleId = moduleId;
    this.currentActionId = null;
    this.actions = {};
  }

  createAction(actionIdentifier) {
    // Create action
    this.actions[actionIdentifier] = {
      moduleId: this.moduleId,
      id: actionIdentifier,
      name: actionIdentifier,
      sentence: actionIdentifier,
      arguments: {},
      callback: () => {
        console.logger.warn(`No callback for action '${actionIdentifier}' in module '${this.moduleId}'`);
      }
    };

    // Save id for chaining
    this.currentActionId = actionIdentifier;

    console.logger.success(`Created action '${actionIdentifier}'.`);

    return this;
  }

  setMeta(name, sentence) {
    Object.assign(this.actions[this.currentActionId], {
      name: name || this.currentActionId,
      sentence: sentence || this.currentActionId
    });

    return this;
  }

  addArgument(name, type) {
    this.actions[this.currentActionId]
      .arguments[name] = {
        type
      };

    return this;
  }

  setCallback(callback) {
    this.actions[this.currentActionId]
      .callback = callback;

    return this;
  }
}


// The RoutesBuilder enables modules to build routes,
// without direct access to the app instance.
// Also does chaining
class RoutesBuilder {
  constructor(moduleId) {
    this.moduleId = moduleId;
    this.routes = [];
  }

  get(route, ...args) {
    this.routes.push({
      moduleId: this.moduleId,
      route,
      method: 'GET',
      args
    });

    return this;
  }

  post(route, ...args) {
    this.routes.push({
      route,
      method: 'POST',
      args
    });

    return this;
  }

  patch(route, ...args) {
    this.routes.push({
      route,
      method: 'PATCH',
      args
    });

    return this;
  }

  put(route, ...args) {
    this.routes.push({
      route,
      method: 'PUT',
      args
    });

    return this;
  }
}


class AccessoryBuilder {
  constructor(moduleId) {
    this.moduleId = moduleId;
    this.Characteristic = Characteristic;
    this.Service = Service;
    this.accessories = [];
  }

  createAccessory(name, id) {
    if (!name || !id) {
      console.logger.error('An accessory wasn\'t supplied with a proper name or id. These two must be provided.');
      return null;
    }

    const outletUUID = uuid.v3({
      namespace: uuid.namespace.url,
      name: `${this.moduleId}-${id}`
    });

    const accessory = new Accessory(name, outletUUID);
    this.accessories.push(accessory);

    console.logger.success(`Created accessory '${name}'.`);

    return accessory;
  }
}


function renderTemplate(templateFileName, moduleId) {
  return fs.readFileSync(path.resolve(__dirname, moduleId, templateFileName), 'utf8');
}


class WidgetBuilder {
  constructor(moduleId) {
    this.moduleId = moduleId;
    this.widgets = {};
  }

  createWidget(name, widgetContent) {
    let content;

    if (!isFunction(widgetContent)) {
      if (server.cacheTemplates) {
        content = renderTemplate(widgetContent, this.moduleId);
      } else {
        content = () => renderTemplate(widgetContent, this.moduleId);
      }
    } else {
      content = widgetContent;
    }

    const widget = {
      name,
      id: `${this.moduleId}-${name.toLowerCase()}`,
      content
    };

    this.widgets[widget.id] = widget;

    console.logger.success(`Created widget '${name}'.`);

    return this;
  }
}

module.exports = {
  TriggerBuilder,
  ActionBuilder,
  RoutesBuilder,
  AccessoryBuilder,
  WidgetBuilder
};
