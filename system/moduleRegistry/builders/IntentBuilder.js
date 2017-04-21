const Intent = require('../../intent/Intent');
const Entity = require('../../intent/Entity');

// The Intent builder is responsible for registering intents and entities
// that are used for the text intent parser.
// That way, modules can register voice commands etc.
class IntentBuilder {
  constructor() {
    this.intents = [];
    this.entities = [];
  }

  createIntent(name) {
    const intent = new Intent(name);

    this.intents.push(intent);

    return intent;
  }

  createEntitiy(name, values) {
    const entity = new Entity(name, values);

    this.entities.push(entity);

    return entity;
  }
}

module.exports = IntentBuilder;
