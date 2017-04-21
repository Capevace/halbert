const socketioJwt = require('socketio-jwt');
const widgets = require('../widgets');
const { logEvent, getReadbackLogs } = require('../../log');

// The Interface socket is the socket that communicates with
// the web interface and thus creates a represantation of the system's state
// across all open interfaces. That way there's no problems with data not
// being the same on multiple displays for example.
function setupInterfaceSocket(io, moduleRegistry) {
  const interfaceSocket = io.of('/interface');
  interfaceSocket.use(
    socketioJwt.authorize({
      secret: 'interfacesecret',
      handshake: true
    })
  );

  interfaceSocket.on('connection', socket => {
    socket.emit('session-id', {
      id: SESSION_ID
    });

    socket.on('session-id-request', onSessionIdRequest.bind(null, socket));
    socket.on('readback-logs-request', onReadbackLogRequest.bind(null, socket));
    socket.on('emit-trigger', onEmitTriggerRequest.bind(null, moduleRegistry));
    socket.on('run-action', onRunActionRequest.bind(null, moduleRegistry));
    socket.on('widget-updated', onWidgetUpdated.bind(null, socket));
    socket.on('disconnect', onDisconnect);
  });

  logEvent.on('log', logString => io.sockets.emit('log', { logString }));

  return interfaceSocket;
}

function onSessionIdRequest(socket) {
  socket.emit('session-id', {
    id: SESSION_ID
  });
}

function onReadbackLogRequest(socket) {
  socket.emit('readback-logs', {
    logs: getReadbackLogs()
  });
}

function onEmitTriggerRequest(moduleRegistry, { trigger, data }) {
  console.logger.info('Received command to emit trigger', trigger);
  moduleRegistry.emitTrigger(trigger, data);
}

function onRunActionRequest(moduleRegistry, { action, data }) {
  console.logger.info('Received command to execute action', action);
  moduleRegistry.runAction(action, data);
}

function onWidgetUpdated(socket, widget) {
  widgets.updateWidget(widget);
  socket.emit('dashboard-refresh');
}

function onDisconnect() {
  console.logger.info('Client disconnected from IO.');
}

module.exports = setupInterfaceSocket;
