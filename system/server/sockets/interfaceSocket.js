const socketioJwt = require('socketio-jwt');
const widgets = require('../widgets');
const { logEvent, getReadbackLogs } = require('../../log');

// The Interface socket is the socket that communicates with
// the web interface and thus creates a represantation of the system's state
// across all open interfaces. That way there's no problems with data not
// being the same on multiple displays for example.
function setupInterfaceSocket(io) {
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
    socket.on('emit-trigger', onEmitTriggerRequest);
    socket.on('run-action', onRunActionRequest);
    socket.on('widget-updated', onWidgetUpdated);
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

function onEmitTriggerRequest({ trigger, data }) {
  console.logger.info('Received command to emit trigger', trigger);
  modules.emitTrigger(trigger, data);
}

function onRunActionRequest({ action, data }) {
  console.logger.info('Received command to execute action', action);
  modules.runAction(action, data);
}

function onWidgetUpdated(widget) {
  widgets.updateWidget(widget);
  socket.emit('dashboard-refresh');
}

function onDisconnect() {
  console.logger.info('Client disconnected from IO.');
}

module.exports = setupInterfaceSocket;
