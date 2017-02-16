// The Intent socket is used for communication with the Adapt Intent
// Parser which is a python process running in the background.
// For some reason, communication via streams was not working, so this is
// a workaround, that works quite well.
function setupIntentSocket(io) {
  const intentKey = 'INTENT_KEY';

  const intentSocket = io.of('/intent');
  intentSocket.on('connection', socket => {
    console.log('intent connection');
    socket.emit('update_intents_request', { intents: [] });
  });

  // This will authenticate the python script's socket.
  // Since there will never be communication over the internet, we can use a simple
  // fixed key that will be checked.
  intentSocket.use((socket, next) => {
    if (socket.request.headers.authkey === intentKey) return next();

    // We could throw an error here, but socketIO swallows it.
    console.logger.error(
      'Intent-IO authentication failed. Please make sure the Intent-Parser can connect to the socket. If this error occurred after setup, someone may be trying to connect to your H.A.L.B.E.R.T. instance. Change the intent secret just in case.'
    );
  });

  return intentSocket;
}

module.exports = setupIntentSocket;
