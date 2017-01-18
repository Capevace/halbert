const modules = require('../modules');
const systemEvent = require('../system-event');
const widgets = require('./widgets');
const { logEvent, getReadbackLogs } = require('../log');

function setupSockets(io) {
  io.on('connection', socket => {
    socket.emit('session-id', {
      id: SESSION_ID
    });

    socket.on('request-session-id', () => {
      socket.emit('session-id', {
        id: SESSION_ID
      });
    });

    socket.on('request-readback-logs', () => socket.emit('readback-logs', {
      logs: getReadbackLogs()
    }));

    socket.on('run-action', ({ action, data }) => {
      console.logger.info('Received command to execute action', action);
      modules.runAction(action, data);
    });

    socket.on('widget-updated', (widget) => {
      widgets.updateWidget(widget);
      socket.emit('dashboard-refresh');
    });

    socket.on('disconnect', () => {
      console.logger.info('Client disconnected from IO.');
    });
  });

  logEvent.on('log', logString => io.sockets.emit('log', { logString }));

  systemEvent.emit('socket.io-ready', io);
}

module.exports = {
  setupSockets
};
