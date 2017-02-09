const { find } = require("lodash");
// const accessories = require('./accessories');

module.exports = builder => {
  console.log(builder.state.get);
  const actions = require("./actions")(builder.state);

  builder.triggers
    .createTrigger("switch.on")
    .setMeta("Switch set to on", "a switch was set to on")
    .addArgument("switchId", "string");

  builder.triggers
    .createTrigger("switch.off")
    .setMeta("Switch set to off", "a switch was set to off")
    .addArgument("switchId", "string");

  builder.actions
    .createAction("switch.on")
    .setMeta("Set Switch to on", "set a switch to on")
    .addArgument("switchId", "string")
    .setCallback(actions.on);

  builder.actions
    .createAction("switch.off")
    .setMeta("Set Switch to off", "set a switch to off")
    .addArgument("switchId", "string")
    .setCallback(actions.off);

  builder.widgets
    .createWidget("Switch", "widget-switch", "switch.html")
    .addSetting("switchId", "string")
    .onDataRequest(settings => {
      return {
        switch: find(HALBERT_CONFIG.modules.switches.available, {
          id: settings.switchId
        })
      };
    })
    .createWidget("Multi-Switch", "widget-multi-switch", "multi-switch.html")
    .onDataRequest(settings => {
      return {
        switches: HALBERT_CONFIG.modules.switches.available.filter(
          s => settings.switches.includes(s.id)
        )
      };
    });
};
// module.exports = {
//   info: {
//     name: 'Switches',
//     description: 'Enables you to use switches for lights or remote plugs.',
//     id: 'switches',
//     author: 'Lukas von Mateffy (@Capevace)',
//     type: 'physical',
//     usesGPIO: true
//   },
//   widgetSettings: {
//     switchId: {
//       type: "string",
//       title: 'Switch-ID'
//     }
//   },
//   triggers,
//   actions,
//   accessories
// };
// {
//   id: 1,
//   type: 'remote',
//   states: {
//     on: '01001010011001001',
//     off: '01001010011001111'
//   }
// }
