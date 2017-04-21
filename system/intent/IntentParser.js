const path = require('path');
const EventEmitter = require('events');
const spawn = require('child_process').spawn;
const uuid = require('uuid-1345');
const systemEventEmitter = require('../systemEventEmitter');

// The IntentParser is used to invoke the Adapt Framework made by Mycroft.
// We're using that framework wor natural langage intent parsing.
//
// The main reason we're not using hinzundcode's 'adaptjs' is that we need to be able to
// insert / update entities and intents later on. The latter only enables you to specify the both on start.
class IntentParser {
  constructor(intentKey, adaptInstallPath) {
    // When theres no specific install path given (e.g. for testing)
    // we want to use a "defualt" one. In this case we're using the one included in our python virtualenv.
    if (!adaptInstallPath) {
      adaptInstallPath = path.resolve(
        __dirname,
        '../../env/halbert_python_env/src/adapt-parser'
      );
    }

    this.shellIsSetup = false;
    this.cachedIntents = [];
    this.cachedEntities = [];
    this.intentSocket = null;

    // We create a new python shell, which wraps around the adapt parser,
    // and exposes a protocol to us, so we can communicate with it using our socketio instance.
    this.shell = spawn('python', [
      path.resolve(__dirname, 'worker.py'),
      adaptInstallPath,
      intentKey
    ]);

    this.shell.stderr.on('data', data => {
      console.logger.error(
        'An error occurred in the intent python shell.',
        data
      );
    });

    this.shell.on('close', code => {
      console.logger.info(`Intent Python shell finished with status '${code}'`);
    });

    this.events = new EventEmitter();
  }

  onSocketConnection(intentSocket) {
    this.shellIsSetup = true;
    this.intentSocket = intentSocket;
    this.intentSocket.on('parsed_intent', payload =>
      this.events.emit('intent-socket-parsed-query', payload));
    this.events.emit('connection-established');
  }

  // Used to insert a new entity into the system.
  insertEntity(entity) {
    this._sendInsertEntitiesRequest([entity.encode()]);
  }

  // Enables you to insert multiple entities at once.
  insertEntities(entities) {
    const encodedEntities = entities.map(entity => entity.encode());
    this._sendInsertEntitiesRequest(encodedEntities);
  }

  // Used to insert a new intent into the system.
  insertIntent(intent) {
    this._sendInsertIntentRequest([intent.encode()]);
  }

  // Enables you to insert multiple intents at once.
  insertIntents(intents) {
    const encodedIntents = intents.map(intent => intent.encode());
    this._sendInsertIntentRequest(encodedIntents);
  }

  // Returns a promise for when the intent has been parsed.
  // In the then callback us a list of possible intents.
  parse(intentQuery) {
    return new Promise((resolve, reject) => {
      const queryId = uuid.v4();
      if (!this.shellIsSetup) {
        this.events.on('connection-established', () =>
          this._sendParseRequest(intentQuery, queryId).then(resolve));
      } else {
        this._sendParseRequest(intentQuery, queryId).then(resolve);
      }
    });
  }

  _sendInsertEntitiesRequest(intents) {
    this.intentSocket.emit('update_entities_request', {
      entities
    });
  }

  _sendInsertIntentRequest(intents) {
    this.intentSocket.emit('update_intents_request', {
      intents
    });
  }

  _sendParseRequest(query, queryId) {
    return new Promise(resolve => {
      // We subscribe ourselves to the intent emitter,
      this.events.on('intent-socket-parsed-query', () => {
        // We check, if the ID that came back is the one we sent out.
        // That means it's out request => we can resolve our promise
        if (payload.id === queryId) {
          this.events.removeListener(
            'intent-socket-parsed-query',
            onParseComplete
          );
          resolve(payload.intents);
        }
      });

      this.intentSocket.emit('parse_intent_request', {
        query,
        id: uuid.v4()
      });
    });
  }

  end() {
    this.shell.end(err => {
      // TODO: replace with internal error handling.
      // Not needed that much but nice nevertheless.
      if (err) throw err;
    });
  }
}

module.exports = IntentParser;
