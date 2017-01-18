#!/usr/bin/env node

module.exports = function (configPath, modulesPath) {
  global.CONFIG_PATH = configPath;
  global.MODULES_PATH = modulesPath;

  require('./system');
};
