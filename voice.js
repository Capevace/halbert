const record = require('node-record-lpcm16');
const player = require('play-sound')();
const {Detector, Models} = require('snowboy');

const models = new Models();

models.add({
  file: './system/oldResources/Halbert.pmdl',
  sensitivity: '0.5',
  hotwords : 'halbert'
});

const detector = new Detector({
  resource: "./system/oldResources/common.res",
  models: models,
  audioGain: 2.0
});

// detector.on('silence', function () {});
// detector.on('sound', function () {});
// detector.on('error', function () {});
let listeningTimeout;
process.stdout.write("\tHAL: *relaxing*\r");
detector.on('hotword', function (index, hotword) {
  process.stdout.write("\tHAL: Yeah?        \r");

  clearTimeout(listeningTimeout);
  listeningTimeout = setTimeout(() => {
    process.stdout.write("\tHAL: *relaxing*\r");
  }, 3000);

  player.play('./system/oldResources/ding.wav', function (err) {
  	if (err) throw err;
  })
});

const mic = record.start({
  threshold: 0,
  verbose: false
});

mic.pipe(detector);
