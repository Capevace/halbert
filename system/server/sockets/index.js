const systemEventEmitter = require('../../systemEventEmitter');
const setupIntentSocket = require('./intentSocket');
const setupInterfaceSocket = require('./interfaceSocket');

function setupSockets(io, moduleRegistry) {
  const intentSocket = setupIntentSocket(io, moduleRegistry);
  systemEventEmitter.emit('intent-socket-ready', intentSocket);

  const interfaceSocket = setupInterfaceSocket(io, moduleRegistry);
  systemEventEmitter.emit('interface-socket-ready', interfaceSocket);
}

module.exports = setupSockets;
