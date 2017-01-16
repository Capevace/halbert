const modules = require('../modules/modules');
const database = require('../database');
const uuid = require('uuid-1345').v4;

// database
//   .set('widgets', [
//     {
//       id: 'voice-h5j7A',
//       title: 'Voice Control (debug)',
//       moduleId: 'voice',
//       componentSize: {
//         width: 1,
//         height: 1
//       },
//       customData: {},
//     },
//     {
//       id: 'switches-j3Sla',
//       title: 'Desk LEDs',
//       moduleId: 'switches',
//       componentSize: {
//         width: 1,
//         height: 1
//       },
//       customData: {
//         switchId: 'desk-leds'
//       },
//       widgetSettings: {
//         switchId: {
//           type: 'string'
//         }
//       }
//     },
//     {
//       id: 'switches-4Ak34',
//       title: 'Second Plug',
//       moduleId: 'switches',
//       componentSize: {
//         width: 1,
//         height: 1
//       },
//       customData: {
//         switchId: 'desk-light'
//       }
//     },
//     {
//       id: 'music-b45Ss',
//       title: 'Music',
//       moduleId: 'music',
//       componentSize: {
//         width: 2,
//         height: 1
//       },
//       customData: {},
//     },
//   ])
//   .value()

function renderWidgetTemplates() {
  const templates = modules.getTemplates();
  let render = '';

  Object.keys(templates).forEach(templateKey => {
    render = render
      + `\n<!-- Start Template: ${templateKey}-->`
      + '\n' + templates[templateKey]
      + `\n<!-- End Template: ${templateKey}-->`;
  });

  return render;
}

function getWidgets() {
  return database
    .get('widgets');
}

function updateWidget(widget) {
  database
    .get('widgets')
    .updateById(widget.id, widget)
    .value();
}

module.exports = {
  renderWidgetTemplates,
  getWidgets,
  updateWidget
};
