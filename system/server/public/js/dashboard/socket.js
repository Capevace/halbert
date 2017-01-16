window.socket = io.connect(location.toString(), {
  query: 'token=' + window.IO_TOKEN
});
window.SESSION_ID = null;

// Reload every 4.5 hours so deal with the expiring token
setTimeout(() => {
  window.location.reload(true);
}, 1000*60*60*4.5);

socket.on('connect', () => {
  console.info('Connected');

  $(document).ready(() => {
    $('#connection-label code')
      .text('Connected')
      .parent()
      .addClass('connected');

    $('#page-loader').removeClass('page-loader-loading');
  });
});

socket.on('disconnect', () => {
  console.info('Disconnected');

  $(document).ready(() => {
    $('#connection-label code')
      .text('Disconnected')
      .parent()
      .removeClass('connected');
  });
});

socket.on('reconnect', () => {
  console.info('Reconnected');

  socket.emit('request-session-id');
});

socket.on('dashboard-refresh', (data) => {
  window.location.reload(true);
});

socket.on('session-id', data => {
  console.info('Session-ID:', data.id);

  if (window.SESSION_ID) {
    if (window.SESSION_ID !== data.id) {
      // session changed, completely reload
      console.info('Session-ID changed. Reloading page...');
      window.location.reload(true);
    }
  }
  window.SESSION_ID = data.id;
});

socket.on('log', data => {
  console.log(data.logString);
});

function module(moduleId) {
  const state = state(moduleId);
  const communication = {
    on: (eventName, callback) => socket.on('com-server-' + moduleId + '.' + eventName, callback),
    emit: (eventName, payload) => socket.emit('com-client-' + moduleId + '.' + eventName, payload)
  };

  return {
    state,
    communication
  };
}

function state(moduleId) {
  const requestState = (stateKey) => socket.emit('request-state', {
    key: moduleId + '.' + stateKey
  });

  const update = (stateKey, value) => socket.emit('update-state', {
    value
  });

  const listen = (stateKey, callback) => {
    socket.on('state-updated-' + moduleId + '.' + stateKey, callback);
    socket.on('state-error-' + moduleId + '.' + stateKey, payload => console.error(payload.error));

    // Enable a "refresh of state" when the state reconnects
    socket.on('reconnect', requestState.bind(null, stateKey));

    // And then request the state right now
    requestState(stateKey);
  };

  return {
    requestState,
    update,
    listen
  };
}

function runAction(action, data) {
  socket.emit('run-action', {
    action,
    data
  });
}

window.state = state;
