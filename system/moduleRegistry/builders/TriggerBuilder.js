// The TriggerBuilder class is a utility to create triggers.
// The good thing about it is, that it's chainable.
class TriggerBuilder {
  constructor(moduleId, triggerEmitter) {
    this.moduleId = moduleId;
    this.currentTriggerId = null;
    this.triggers = {};
    this.triggerEmitter = triggerEmitter;
  }

  createTrigger(triggerIdentifier) {
    // Create trigger
    this.triggers[triggerIdentifier] = {
      moduleId: this.moduleId,
      id: triggerIdentifier,
      name: triggerIdentifier,
      sentence: triggerIdentifier,
      returnTypes: {}
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

  addOutputType(name, type) {
    this.triggers[this.currentTriggerId].returnTypes[name] = {
      type
    };

    return this;
  }

  listen(trigger, condition, callback) {
    console.logger.warn(trigger, condition, callback);
    // If no condition passed, use callback instead
    // if (!callback) callback = condition;
    let usesCondition = true;
    if (!callback) {
      callback = condition;
      usesCondition = false;
    }

    this.triggerEmitter.on(trigger, triggerOutput => {
      // If no callback supplied here, means we don't have conditions, or invalid function input
      if (!usesCondition) {
        callback(triggerOutput);
        return;
      }

      const matchesCondition = Object.keys(condition).reduce(
        (isMatching, conditionKey) => {
          // If we're already not matching, return false to exit the loop
          if (!isMatching) return false;
          return triggerOutput[conditionKey] === condition[conditionKey];
        },
        true
      );

      if (matchesCondition) callback(triggerOutput);
    });

    return this;
  }

  unlisten(trigger, callback) {
    this.triggerEmitter.removeListener(trigger, callback);

    return this;
  }

  getTriggers() {
    // Placeholder for later replacement with prototype
    return {};
  }
}

module.exports = TriggerBuilder;
