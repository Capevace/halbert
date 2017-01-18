const uuid = require('uuid-1345').v4;
const config = require(CONFIG_PATH);

// A device UUID is required, so the device is uniquely identifieable.
// It is required for example for things like Home kit.
if (!config.device || !config.device.uuid) {
  console.logger.error('No device UUID set yet. Please paste a generated one or the one below into your config file.', uuid());
  process.exit(1);
}

module.exports = config;
