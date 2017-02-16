// A lot of this code is extracted from the adaptjs npm module.
// It was heavily modified to fit this usecase.

const IntentParser = require('./IntentParser');
const Intent = require('./Intent');
const Entity = require('./Entity');

var spawn = require('child_process').spawn;

// const intentParser = new IntentParser();

const ls = spawn('python', [
  require('path').resolve(__dirname, 't.py'),
  '/Users/Lukas/Projects/halbert/env/halbert_python_env/src/adapt-parser'
]);

ls.stdout.on('data', data => {
  console.log(`stdout: ${data}`);
});

ls.stdin.on('data', data => {
  console.log(`stdin: ${data}`);
});

ls.on('message', data => {
  console.log(`message: ${data}`);
});

ls.stderr.on('data', data => {
  console.log(`stderr: ${data}`);
});

ls.on('close', code => {
  console.log(`child process exited with code ${code}`);
});

setTimeout(
  () => {
    console.log('writing');
    ls.stdin.write('sdsd\n');
  },
  1000
);
//
// setTimeout(
//   () => {
//     intentParser.insertEntities([
//       new Entity('WeatherKeyword', ['weather']),
//       new Entity('WeatherType', ['snow', 'rain', 'wind', 'sleet', 'sun']),
//       new Entity('Location', ['Seattle', 'San Francisco', 'Tokyo'])
//     ]);
//
//     const intent = new Intent('WeatherIntent')
//       .require('WeatherKeyword', 'weatherkey')
//       .optionally('WeatherType')
//       .require('Location');
//
//     intentParser.insertIntent(intent);
//
//     intentParser
//       .parse('Whats the weather in San Francisco today?')
//       .then(intents => console.log(intents))
//       .catch(err => console.log('err', err));
//   },
//   2000
// );

module.exports = {
  IntentParser
};
