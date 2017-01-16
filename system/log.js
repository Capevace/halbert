const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

let readbackLogs = [];
const logEvent = new EventEmitter();
const startupDate = new Date();
const writeStream = fs.createWriteStream(path.resolve(__dirname, `../logs/${startupDate.getUTCFullYear()}-${startupDate.getUTCMonth() + 1}-${startupDate.getUTCDate()}.log`), {
  flags: 'a'
});

writeStream.write('\n\n\nStarting Server at: ' + startupDate.toISOString() + '\n');

const originalLog = console.log;

const log = (orignalArguments, type, ...arguments) => {
  // originalLog(logString);
  const date = new Date();
  let dateString = '';

  switch (type) {
    case 'info':
      dateString = chalk.cyan.bold(`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`);
      break;
    case 'error':
      dateString = chalk.red.bold(`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`);
      break;
    case 'warn':
      dateString = chalk.yellow.bold(`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`);
      break;
    case 'success':
      dateString = chalk.green.bold(`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`);
      break;
    case 'say':
      dateString = chalk.magenta.bold(`[H.A.L.B.E.R.T.]`);
      break;
  }

  const logString =
    orignalArguments.reduce((string, argument) =>
      (typeof argument === 'object')
        ? string + ' ' + JSON.stringify(argument, null, 2)
        : string + ' ' + argument
    , '')
    + '\n';

  originalLog(dateString, ...arguments);
  writeStream.write(`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}] ${type.toUpperCase()}` + logString, 'utf8');
  logEvent.emit('log', dateString + logString);

  const maxLogCount = 250;
  readbackLogs.push(dateString + logString);
  if (readbackLogs.length > maxLogCount) {
    readbackLogs = readbackLogs.slice(readbackLogs.length - maxLogCount, readbackLogs.length);
  }
};

const getReadbackLogs = () => readbackLogs;

console.logger = {};

console.logger.log = function (...arguments) {
  const date = new Date();
  log(arguments, 'log', ...arguments);
};

console.logger.info = function (...arguments) {
  const date = new Date();
  log(arguments, 'info', ...arguments);
};

console.logger.error = function (...arguments) {
  const date = new Date();
  log(arguments, 'error', ...arguments);
};

console.logger.warn = function (...arguments) {
  const date = new Date();
  log(arguments, 'warn', ...arguments);
};

console.logger.success = function (...arguments) {
  const date = new Date();
  log(arguments, 'success', ...arguments);
};

console.logger.say = function (...arguments) {
  log(arguments, 'say', chalk.bgBlack(arguments.join(' ')));
};

module.exports = {
  logEvent,
  getReadbackLogs
};
