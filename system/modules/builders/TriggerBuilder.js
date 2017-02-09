// The TriggerBuilder class is a utility to create triggers.
// The good thing about it is, that it's chainable.
class TriggerBuilder {
  constructor(moduleId, triggerEmitter) {
    this.moduleId = moduleId;
    this.triggerEmitter = triggerEmitter;
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
    this.triggers[this.currentTriggerId].arguments[name] = {
      type
    };

    return this;
  }

  listen(trigger, callback) {
    this.triggerEmitter.on(trigger, callback);

    return this;
  }
}

module.exports = TriggerBuilder;
