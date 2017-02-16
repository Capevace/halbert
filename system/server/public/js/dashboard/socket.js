/* global io, $ */
console.log(`${location.toString()}interface`);
const socket = io.connect(`${location.toString()}interface`, {
  query: `token=${window.IO_TOKEN}`
});

window.SESSION_ID = null;
window.socket = socket;

// Reload every 4.5 hours so deal with the expiring token
setTimeout(
  () => {
    window.location.reload(true);
  },
  1000 * 60 * 60 * 4.5
);

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

  socket.emit('session-id-request');
});

socket.on('dashboard-refresh', () => {
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
  const styles = [];
  const t = stripHtml(data.logString)
    .replace(/\[1m/g, '')
    .replace(/\[22m/g, '')
    .replace(/\[33m/g, () => {
      styles.push('color:#c5a628;');
      return '%c';
    })
    .replace(/\[31m/g, () => {
      styles.push('color:#bb3c3c;');
      return '%c';
    })
    .replace(/\[32m/g, () => {
      styles.push('color:#3cbb8e;');
      return '%c';
    })
    .replace(/\[36m/g, () => {
      styles.push('color:#3c7ebb;');
      return '%c';
    })
    .replace(/\[35m/g, () => {
      styles.push('color:#3c4abb;');
      return '%c';
    })
    .replace(/\[39m/g, () => {
      styles.push('color:black;');
      return '%c';
    });
  console.log(t, ...styles);
});

// dont think well need this anymore, but am keeping for now
// TODO: remove
// function module(moduleId) {
//   const state = state(moduleId);
//   const communication = {
//     on: (eventName, callback) => socket.on(`com-server-${  moduleId  }.${  eventName}`, callback),
//     emit: (eventName, payload) => socket.emit(`com-client-${  moduleId  }.${  eventName}`, payload)
//   };
//
//   return {
//     state,
//     communication
//   };
// }

function state(moduleId) {
  const requestState = stateKey => socket.emit('request-state', {
    key: `${moduleId}.${stateKey}`
  });

  const update = (stateKey, value) => socket.emit('update-state', {
    value
  });

  const listen = (stateKey, callback) => {
    socket.on(`state-updated-${moduleId}.${stateKey}`, callback);
    socket.on(`state-error-${moduleId}.${stateKey}`, payload =>
      console.error(payload.error));

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
  // eslint-disable-line
  socket.emit('run-action', {
    action,
    data
  });
}

function emitTrigger(trigger, data) {
  socket.emit('emit-trigger', {
    trigger,
    data
  });
}

window.state = state;
window.runAction = runAction;
window.emitTrigger = emitTrigger;
