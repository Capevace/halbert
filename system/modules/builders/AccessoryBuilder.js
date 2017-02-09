const { Accessory, Service, Characteristic } = require("hap-nodejs");
const uuid = require("uuid-1345");

class AccessoryBuilder {
  constructor(moduleId) {
    this.moduleId = moduleId;
    this.Characteristic = Characteristic;
    this.Service = Service;
    this.accessories = [];
  }

  createAccessory(name, id) {
    if (!name || !id) {
      console.logger.error(
        "An accessory wasn't supplied with a proper name or id. These two must be provided."
      );
      return null;
    }

    const outletUUID = uuid.v3({
      namespace: uuid.namespace.url,
      name: `${this.moduleId}-${id}`
    });

    const accessory = new Accessory(name, outletUUID);
    this.accessories.push(accessory);

    console.logger.success(`Created accessory '${name}'.`);

    return accessory;
  }
}

module.exports = AccessoryBuilder;
