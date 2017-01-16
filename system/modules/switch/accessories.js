const config = require('../../config');
const { Accessory, Service, Characteristic } = require('hap-nodejs');
const uuid = require('uuid-1345');
const { runAction } = require('../modules');
const { getState, stateEvents } = require('../state').state('switches');

function setupAccessory(switchConfig) {
  const outletUUID = uuid.v3({
    namespace: uuid.namespace.url,
    name: switchConfig.id
  });
  const outlet = new Accessory(switchConfig.name, outletUUID);

  outlet
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, 'HALBERT')
    .setCharacteristic(Characteristic.Model, `${switchConfig.type}-${switchConfig.protocol}-switch`)
    .setCharacteristic(Characteristic.SerialNumber, switchConfig.id);

  outlet.on('identify', (paired, callback) => {
    console.logger.info(`${switchConfig.name} was identified. Paired: ${paired}.`);
    callback();
  });

  outlet
    .addService(Service.Outlet, switchConfig.name)
    .getCharacteristic(Characteristic.On)
    .on('set', (value, callback) => {
      const action = value
        ? 'switch.on'
        : 'switch.off';

      runAction(action, {
        switchId: switchConfig.id
      });

      callback();
    });

  outlet
    .getService(Service.Outlet)
    .getCharacteristic(Characteristic.On)
    .on('get', (callback) => {
      callback(null, getState('switch_' + switchConfig.id).state);
    });

  return outlet;
}

let switchAccessories = [];

if (config.modules.switches && config.modules.switches.available) {
  config.modules.switches.available
    .forEach(switchConfig => {
      switchAccessories.push(setupAccessory(switchConfig));
    });
}

module.exports = switchAccessories;
