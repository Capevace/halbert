const path = require('path');
const EventEmitter = require('events');
const PythonShell = require('python-shell');

// The IntentParser is used to invoke the Adapt Framework made by Mycroft.
// We're using that framework wor natural langage intent parsing.
//
// The main reason we're not using hinzundcode's 'adaptjs' is that we need to be able to
// insert / update entities and intents later on. The latter only enables you to specify the both on start.
class IntentParser {
  constructor(adaptInstallPath) {
    // When theres no specific install path given (e.g. for testing)
    // we want to use a "defualt" one. In this case we're using the one included in our python virtualenv.
    if (!adaptInstallPath) {
      adaptInstallPath = path.resolve(
        __dirname,
        '../../env/halbert_python_env/src/adapt-parser'
      );
      console.log(adaptInstallPath);
    }

    // We create a new python shell to communicate with our Adapt instance.
    // Communications are running over stdin/stdout and using JSON.
    // The "first" argument (it's actually sys.argv[1], so the second argument) is the path
    // to the preferred Adapt Install.
    this.shell = new PythonShell('worker.py', {
      mode: 'json',
      args: [adaptInstallPath],
      scriptPath: path.resolve(__dirname)
    });
    this.shell.on('message', m => console.log(m));
    this.shell.on('close', () => console.log('closed'));
    this.shell.stdout.on('data', d => console.log(d));
    this.shell.stderr.on('data', d => console.log(d));
    this.shell.stdin.on('data', d => console.log(d));
    this.intentEmitter = new EventEmitter();
  }

  onMessage(message) {
    console.log(message);
    switch (message.type) {
    case 'intents':
      this.intentEmitter.emit('intents', message.intents);
    case 'error':
    default:
        // An unknown action was passed into out python worker. Should not break so we can ignore.
      throw new Error(message.error);
    }
  }

  // Used to insert a new entity into the system.
  insertEntity(entity) {
    this.shell.send({
      type: 'update_entities',
      payload: {
        entities: [entity.encode()]
      }
    });
  }

  // Enables you to insert multiple entities at once.
  insertEntities(entities) {
    this.shell.send({
      type: 'update_entities',
      payload: {
        entities: entities.map(entity => entity.encode())
      }
    });
  }

  // Used to insert a new intent into the system.
  insertIntent(intent) {
    this.shell.send({
      type: 'update_intents',
      payload: {
        intents: [intent.encode()]
      }
    });
  }

  // Enables you to insert multiple intents at once.
  insertIntents(intents) {
    this.shell.send({
      type: 'update_intents',
      payload: {
        intents: intents.map(intent => intent.encode())
      }
    });
  }

  // Returns a promise for when the intent has been parsed.
  // In the then callback us a list of possible intents.
  parse(intentQuery) {
    return new Promise((resolve, reject) => {
      // We subscribe ourselves to the intent emitter,
      // which emits an 'intents' event, everytime our shell's 'message' callback contains an intent result.
      // This should work as long as we're not requesting multiple intents per second or something.
      // Meh.
      const onParseComplete = intents => {
        this.intentEmitter.removeListener('intents', onParseComplete);
        resolve(intents);
      };

      this.intentEmitter.on('intents', onParseComplete);
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
