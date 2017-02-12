const EventEmitter = require('events');
const systemEvent = require('../system-event');
const { set, get } = require('lodash');

const stateCache = {};
const changeEmitter = new EventEmitter();

// The State function exposes a state object unique for a specific stateId.
// The stateId should (but is not required to) resemble the moduleId used.
// When calling setState, HALBERT can properly update web interfaces and
// other systems that react to state changes.
function state(stateId) {
  if (!stateCache[stateId]) {
    stateCache[stateId] = {};
  }

  const getState = key => {
    if (key) {
      return get(stateCache[stateId], key);
    }

    return state;
  };

  const setState = (key, value) => {
    set(stateCache[stateId], key, value);

    stateWasUpdated(`${stateId}.${key}`, value);
  };

  return {
    get: getState,
    set: setState,
    stateEvents: {
      on: (key, callback) => {
        changeEmitter.on(`${stateId}.${key}`, callback);
      }
    }
  };
}

// This function stays empty and waits, until the io server was setup.
// Then it gets set to a function that emits an event when stateWasUpdated.
let stateWasUpdated = () => {};

function setupSync(io) {
  // Update the function because we now have io systems
  stateWasUpdated = (stateKey, value) => {
    console.logger.info(`State at ${stateKey} was updated with`, value);
    io.emit(`state-updated-${stateKey}`, {
      value
    });

    changeEmitter.emit(stateKey, value);
  };

  io.on('connection', socket => {
    // When a socket requests a specific state
    // the key is stateId + steteKey
    socket.on('request-state', ({ key }) => {
      console.logger.info(`State for ${key} requested.`);

      const stateForKey = get(stateCache, key);
      if (stateForKey === undefined) {
        console.logger.error(`State for key '${key}' has not been assigned.`);

        // Emitting a state error for better error handling
        socket.emit(`state-error-${key}`, {
          error: `State for key '${key}' has not been assigned.`
        });
        return;
      }

      // Execute state-updated handler, because thats the handler that gets
      // executed when you .listen for a specific state.
      socket.emit(`state-updated-${key}`, {
        value: stateForKey
      });
    });
  });

  console.logger.success('State is now in sync with the IO-Server.');
}

systemEvent.on('socket.io-ready', setupSync);

module.exports = {
  state,
  stateWasUpdated
};
