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

writeStream.write(`\n\n\nStarting Server at: ${  startupDate.toISOString()  }\n`);

const originalLog = console.log;

const log = (orignalArguments, type, ...args) => {
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
    `${orignalArguments.reduce((string, argument) =>
      (typeof argument === 'object')
        ? `${string  } ${  JSON.stringify(argument, null, 2)}`
        : `${string  } ${  argument}`
    , '')
     }\n`;

  originalLog(dateString, ...args);
  writeStream.write(`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}] ${type.toUpperCase()}${logString}`, 'utf8');
  logEvent.emit('log', dateString + logString);

  const maxLogCount = 250;
  readbackLogs.push(dateString + logString);
  if (readbackLogs.length > maxLogCount) {
    readbackLogs = readbackLogs.slice(readbackLogs.length - maxLogCount, readbackLogs.length);
  }
};

const getReadbackLogs = () => readbackLogs;

console.logger = {};

console.logger.log = function (...args) {
  log(args, 'log', ...args);
};

console.logger.info = function (...args) {
  log(args, 'info', ...args);
};

console.logger.error = function (...args) {
  log(args, 'error', ...args);
};

console.logger.warn = function (...args) {
  log(args, 'warn', ...args);
};

console.logger.success = function (...args) {
  log(args, 'success', ...args);
};

console.logger.say = function (...args) {
  log(args, 'say', chalk.bgBlack(args.join(' ')));
};

module.exports = {
  logEvent,
  getReadbackLogs
};
