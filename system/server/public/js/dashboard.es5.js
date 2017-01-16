'use strict';

var station = null;
var widgets = {};
window.socket = io.connect(location.toString());
window.SESSION_ID = null;

socket.on('connect', function () {
  console.info('Connected');
  $('#connection-label code').text('Connected').parent().addClass('connected');
});

socket.on('disconnect', function () {
  console.info('Disconnected');
  $('#connection-label code').text('Disconnected').parent().removeClass('connected');
});

socket.on('reconnect', function () {
  console.info('Reconnected');

  socket.emit('request-session-id');
});

socket.on('dashboard-refresh', function (data) {
  window.location.reload(true);
});

socket.on('session-id', function (data) {
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

function state(moduleId) {
  var requestState = function requestState(stateKey) {
    return socket.emit('request-state', {
      key: moduleId + '.' + stateKey
    });
  };

  var update = function update(stateKey, value) {
    return socket.emit('update-state', {
      value: value
    });
  };

  var listen = function listen(stateKey, callback) {
    socket.on('state-updated-' + moduleId + '.' + stateKey, callback);
    socket.on('state-error-' + moduleId + '.' + stateKey, function (payload) {
      return console.error(payload.error);
    });

    // Enable a "refresh of state" when the state reconnects
    socket.on('reconnect', requestState.bind(null, stateKey));

    // And then request the state right now
    requestState(stateKey);
  };

  return {
    requestState: requestState,
    update: update,
    listen: listen
  };
}

function runAction(action, data) {
  socket.emit('run-action', {
    action: action,
    data: data
  });
}

window.state = state;

function registerWidget(id) {
  var eventSystem = function () {
    return {
      emit: function emit(event, payload) {
        socket.emit(id + '-' + event, payload);
      },
      on: function on(event, callback) {
        socket.on(id + '-' + event, callback);
      }
    };
  }();

  widgets[id] = {
    eventSystem: eventSystem
  };
}

Vue.component('widget-box', {
  template: '#widget-box-template',
  props: ['widget'],
  computed: {
    classObject: function classObject() {
      var widthOneClasses = {
        'col-xs-12': true,
        'col-sm-6': true,
        'col-md-4': true,
        'col-lg-3': true,
        'col-xl-2': true
      };
      var widthTwoClasses = {
        'col-xs-12': true,
        'col-sm-12': true,
        'col-md-8': true,
        'col-lg-6': true,
        'col-xl-4': true
      };
      var widthFullClasses = {
        'col-xs-12': true
      };

      if (this.widget.componentSize.width + '' === 'full') {
        return widthFullClasses;
      } else if (this.widget.componentSize.width + '' === '2') {
        return widthTwoClasses;
      } else {
        return widthOneClasses;
      }
    }
  },
  mounted: function mounted() {
    addResizeListener(this.$el, function () {
      return msnry.layout();
    });
  },
  methods: {
    resize: function resize() {}
  }
});

Vue.component('widget-title', {
  template: '<h6 class="card-title"><slot>{{title}}</slot> <button data-toggle="modal" data-target="#options-modal" class="btn-options float-xs-right" :data-widget="jsonData"><span class="options-dot"></span><span class="options-dot"></span><span class="options-dot"></span></button></h6>',
  props: ['title', 'widgetData'],
  computed: {
    jsonData: function jsonData() {
      return JSON.stringify(this.widgetData || {});
    }
  }
});

Vue.component('options-modal', {
  template: '\n    <div class="modal fade" id="options-modal" tabindex="-1" role="dialog" aria-labelledby="options-modal-label" aria-hidden="true">\n      <div class="modal-dialog" role="document">\n        <div class="modal-content">\n          <div class="modal-header">\n            <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n              <span aria-hidden="true">&times;</span>\n            </button>\n            <h4 class="modal-title" id="options-modal-label">{{widgetData.title}}</h4>\n          </div>\n          <div class="modal-body">\n            ...\n          </div>\n          <div class="modal-footer">\n            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n            <button type="button" class="btn btn-primary">Save changes</button>\n          </div>\n        </div>\n      </div>\n    </div>\n  ',
  props: ['widgetData'],
  updated: function updated() {
    console.info(this.widgetData);
  }
});

Vue.component('control-switch', {
  template: '<div class="control-switch" :class="classObject" @click="onClick"></div>',
  props: ['value', 'onChange', 'disabled'],
  computed: {
    classObject: function classObject() {
      return {
        'control-switch-on': !!this.value,
        'control-switch-disabled': !!this.disabled
      };
    }
  },
  methods: {
    onClick: function onClick() {
      if (this.onChange) {
        if (!this.disabled) this.onChange();
      } else {
        console.warn('This control-switch doesn\'t have a onChange function attached.');
      }
    }
  }
});

Vue.component('loader', {
  template: '<div :class="classObject"><div class="centered-content"><div class="load-circle"></div></div></div>',
  props: ['loading'],
  computed: {
    classObject: function classObject() {
      return {
        'load-circle-container': true,
        'load-circle-container-hidden': !this.loading
      };
    }
  }
});

Vue.component('container', {
  template: '<span><!--<loader :loading="loading"></loader>--><div class="widget-container"><slot></slot></div></span>',
  props: ['loading']
});
