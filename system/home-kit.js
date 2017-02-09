const config = require('./config');
const {
  init,
  Bridge,
  Accessory
} = require('hap-nodejs');
const { getRegisteredModules } = require('./modules');

init();

const bridge = new Bridge('H.A.L.B.E.R.T.', config.device.uuid);

// Identification Event
bridge.on('identify', (paired, callback) => {
  console.logger.info('HomeKit paired:', paired);
  callback();
});

const modules = getRegisteredModules();
Object.keys(modules).forEach(moduleKey => {
  if (!modules[moduleKey].accessories) return;

  modules[
    moduleKey
  ].accessories.forEach(accessory => bridge.addBridgedAccessory(accessory));
});

//
// bridge.addBridgedAccessory(outlet);
bridge.publish({
  username: 'CC:22:3D:E3:CE:F6',
  port: 51826,
  pincode: '012-34-567',
  category: Accessory.Categories.BRIDGE
});
