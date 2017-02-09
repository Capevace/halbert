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
        console.logger.warn(
          `No callback for action '${actionIdentifier}' in module '${this.moduleId}'`
        );
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
    this.actions[this.currentActionId].arguments[name] = {
      type
    };

    return this;
  }

  setCallback(callback) {
    this.actions[this.currentActionId].callback = callback;

    return this;
  }
}

module.exports = ActionBuilder;
