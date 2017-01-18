/* global Vue, addResizeListener, msnry, parseTerminalColors */
//
// Widget Box
//
Vue.component('widget-box', {
  template: `
    <div class="widget grid-item" :class="classObject">
      <div class="card"  :data-id="widget.id" @resize="resize">
        <div class="card-block">
          <widget-title :title="widget.title" :widget-data="widget"></widget-title>
          <component :is="widget.moduleId" :id="widget.id" :module-id="widget.moduleId" :widget-data="widget"></component>
        </div>
      </div>
    </div>
  `,
  props: ['widget'],
  computed: {
    classObject: function () {
      const widthOneClasses = {
        'col-xs-12': true,
        'col-sm-6': true,
        'col-md-4': true,
        'col-lg-3': true,
        'col-xl-2': true
      };
      const widthTwoClasses = {
        'col-xs-12': true,
        'col-sm-12': true,
        'col-md-8': true,
        'col-lg-6': true,
        'col-xl-4': true
      };
      const widthFullClasses = {
        'col-xs-12': true
      };

      if (`${this.widget.componentSize.width  }` === 'full') {
        return widthFullClasses;
      } else if (`${this.widget.componentSize.width  }` === '2') {
        return widthTwoClasses;
      } else {
        return widthOneClasses;
      }
    }
  },
  mounted: function () {
    let timeout = null;
    addResizeListener(this.$el, () => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => msnry.layout(), 100);
    });
  },
  methods: {
    resize: function () {

    }
  }
});


//
// Widget Title
//
Vue.component('widget-title', {
  template: `
    <h6 class="card-title">
      <div class="row">
        <div class="col-9">
          <slot>{{title}}</slot>
        </div>
        <div class="col-3 d-flex justify-content-end">
          <button data-toggle="modal" data-target="#options-modal" class="btn-options float-xs-right" :data-widget="jsonData">
            <span class="options-dot"></span><span class="options-dot"></span><span class="options-dot"></span>
          </button>
        </div>
      </div>
    </h6>
  `,
  props: ['title', 'widgetData'],
  computed: {
    jsonData: function () {
      return JSON.stringify(this.widgetData || {});
    }
  }
});


//
// Options Modal
//
Vue.component('options-modal', {
  template: `
    <div class="modal fade" id="options-modal" tabindex="-1" role="dialog" aria-labelledby="options-modal-label" aria-hidden="true">
      <div class="visible-print-inline">{{widgetData}}</div>
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title" id="options-modal-label">{{widget.title}}</h4>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="container">
              <form class="form">
                <div class="form-group row">
                  <label for="title-input" class="col-3 col-form-label">Title</label>
                  <div class="col-9">
                    <input class="form-control" type="text" v-model="widget.title" id="title-input">
                  </div>
                </div>

                <template v-if="widget.widgetSettings" v-for="(value, key) in widget.widgetSettings">
                  <template v-if="value.type === 'string'">
                    <div class="form-group row">
                      <label for="{{key}}-input" class="col-3 col-form-label">{{value.title || key}}</label>
                      <div class="col-9">
                        <input class="form-control" type="text" v-model="widget.customData[key]" id="{{key}}-input">
                      </div>
                    </div>
                  </template>
                </template>
                <template v-else>
                  <h6>No Widget Settings provided</h6>
                </template>
              </form>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" data-dismiss="modal" @click="submit">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  `,
  props: ['widgetData', 'onSubmit'],
  data: () => ({
    widget: {
      title: 'Untitled Widget'
    }
  }),
  beforeUpdate: function () {
    this.widget = this.widgetData;
  },
  methods: {
    submit: function () {
      if (this.onSubmit)
        this.onSubmit(this.widget);
    }
  }
});


//
// Logs Modal
//
Vue.component('logs-modal', {
  template: `
    <div class="modal fade in" id="logs-modal" tabindex="-1" role="dialog" aria-labelledby="logs-modal-label" aria-hidden="true">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title" id="logs-modal-label">Logs</h4>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
              <samp>
                <template v-for="log in logs">
                  <span v-html="log" class="line"></span><br>
                </template>
              </samp>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  data: () => ({
    logs: []
  }),
  created: function () {
    window.socket.on('readback-logs', payload => {
      this.logs = payload.logs
        .map(log => parseTerminalColors(log));
    });

    window.socket.emit('request-readback-logs');

    window.socket.on('log', payload => {
      this.logs.push(parseTerminalColors(payload.logString));

      if (this.logs.length > 1000) {
        this.logs = this.logs.slice(this.logs.length-1000, this.logs.length - 1);
      }
    });
  }
});


//
// System Info Modal
//
Vue.component('system-info-modal', {
  template: `
    <div class="modal fade in" id="system-info-modal" tabindex="-1" role="dialog" aria-labelledby="system-info-modal-label" aria-hidden="true">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title" id="system-info-modal-label">System-Info</h4>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-3">Uptime</div>
              <div class="col-9"><code>12 hours 41 minutes 13 seconds</code></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  data: () => ({
    logs: []
  }),
  created: function () {
    window.socket.on('readback-logs', payload => {
      this.logs = payload.logs
        .map(log => parseTerminalColors(log));
    });

    window.socket.emit('request-readback-logs');

    window.socket.on('log', payload => {
      this.logs.push(parseTerminalColors(payload.logString));

      if (this.logs.length > 1000) {
        this.logs = this.logs.slice(this.logs.length-1000, this.logs.length - 1);
      }
    });
  }
});


//
// Control Switch
//
Vue.component('control-switch', {
  template: `<div class="control-switch" :class="classObject" @click="onClick"></div>`,
  props: ['value', 'onChange', 'disabled'],
  computed: {
    classObject: function () {
      return {
        'control-switch-on': !!this.value,
        'control-switch-disabled': !!this.disabled
      };
    }
  },
  methods: {
    onClick: function () {
      if (this.onChange) {
        if (!this.disabled)
          this.onChange();
      } else {
        console.warn('This control-switch doesn\'t have a onChange function attached.');
      }
    }
  }
});
