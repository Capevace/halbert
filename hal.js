const nlp = require('speakeasy-nlp');
const natural = require('natural');

const EngineBuilder = require("adaptjs").EngineBuilder;

let builder = new EngineBuilder();

builder.entity("WeatherKeyword", ["weather"]);
builder.entity("WeatherType", ["snow", "rain", "wind", "sleet", "sun"]);
builder.entity("Cities", ["Seattle", "San Francisco", "Tokyo"]);

builder.entity('toggleKeyword', ['toggle', 'switch', 'turn']);
builder.entity('toggleType', ['on', 'off', 'up', 'down']);
builder.entity('toggleObject', ['light', 'music', 'lights']);

builder.entity('room', ['living room', 'bedroom', 'car', 'toilet', 'bathroom']);
builder.entity('location', ['desk', 'ceiling']);

builder.entity('musicKeyword', ['play']);
builder.entity('musicConnector', ['some']);

builder
  .intent('ToggleIntent')
  .require('toggleKeyword')
  .require('toggleObject')
  .optionally('toggleType')
  .optionally('room')
  .optionally('location');

builder
  .intent("WeatherIntent")
  .require("WeatherKeyword", "weatherkey")
  .optionally("WeatherType")
  .require("Cities");

builder
  .intent('MusicIntent')
  .require('musicKeyword')
  .optionally('musicConnector')
  .optionally('musicSong');

let engine = builder.build();
let query = 'toggle the light on the desk in the living room'.toLowerCase();
engine.query(query)
.then(intents => parseIntent(intents, query))
.catch(error => { console.log('d', error); console.log(error.stack); engine.stop(); });

function parseIntent(intents, query) {
  const intent = intents[0];
    console.log(intents);

  if (!intent) {
    engine.stop();
    return;
  }

  switch (intent.intent_type) {
    case 'MusicIntent':
      let songQuery = query.slice(query.indexOf('play') + 4, query.length);
      if ('musicConnector' in intent) {
        songQuery = query.slice(query.indexOf('some') + 4, query.length);
      }

      if (songQuery.charAt(0) === ' ') {
        songQuery = songQuery.slice(1, songQuery.length);
      }

      console.log(songQuery);
      break;
    case 'ToggleIntent':
      break;
    default:
  }


  engine.stop();
}

// strip words like 'please' from input, confuses nlp

let handlers = [];
function createHandler(handler) {
  handlers.push(Object.assign({}, {
    id: parseInt(Math.random() * 9999) + '',
    owners: [],
    actions: [],
    subjects: [],
    adjectives: [],
    // verbs: [],
    // nouns: [],
    requiredTokens: [], // words required
    bannedTokens: [], // words that are banned
    tokens: [],
    handle: function () {
      console.error('A Handler didnt have a handle function! Handler:', this.id);
    }
  }, handler));
}

function evaluateTaskHandlers(task) {
  // Reduce to the best fitting handler
  const bestHandler = handlers.reduce((bestHandler, currentHandler) => {
    const currentScore = evaluateTaskHandler(task, currentHandler);
    console.log(currentHandler.id, currentScore);
    if (currentScore > bestHandler.score) {
      return {
        score: currentScore,
        handler: currentHandler
      };
    }

    return bestHandler;
  }, {score: 0, error: true});

  if (bestHandler.error) {
    console.log('Im sorry, Im afraid I cant do that.')
  } else {
    console.log('Handler that won:', bestHandler.handler.id);
    console.log('With score of:', bestHandler.score);
  }
}

function evaluateTaskHandler(task, handler) {
  let score = 0;

  if (handler.actions.includes(task.action)) {
    score = score + 1;
  } else {
    score = score - 10000;
  }

  handler.subjects.forEach(subject => {
    const distance = natural.JaroWinklerDistance(subject, task.subject);
    score = score + (10 * distance);
  });

  task.tokens.forEach((token) => {
    if (handler.tokens.includes(token)) {
      score = score + 0.05;
    }
  });

  handler.requiredTokens.forEach((requiredToken) => {
    if (!task.tokens.includes(requiredToken)) {
      score = score - 10000;
    }
  });

  handler.bannedTokens.forEach((bannedToken) => {
    if (!task.tokens.includes(bannedToken)) {
      score = score - 10000;
    }
  });

  return score;
}

createHandler({
  id: 'hue-handler',
  actions: ['turn', 'toggle', 'dim', 'set'],
  subjects: ['lights', 'leds', 'led', 'light'],
});

createHandler({
  id: 'spotify-handler',
  actions: ['play', 'turn'],
  subjects: ['the music', 'music'],
  requiredTokens: [], // words required
  bannedTokens: [], // words that are banned
  tokens: ['via', 'spotify', 'up', 'down'],
});

const input = process.argv.slice(2, process.argv.length).join(' ').toLowerCase();
// const c = nlp.classify(input);
// // console.log(c);
// evaluateTaskHandlers(c);

// const classifier = new natural.BayesClassifier();
// classifier.addDocument('turn off the lights', 'hue-handler');
// classifier.addDocument('turn on the lights', 'hue-handler');
// classifier.addDocument('turn on the lights in the x room', 'hue-handler');
// classifier.addDocument('turn off the lights in the x room', 'hue-handler');
// classifier.addDocument('dim the lights', 'hue-handler');
// classifier.addDocument('dim the lights in the x room', 'hue-handler');
// classifier.addDocument('dim the lights in the x room to y percent', 'hue-handler');
// classifier.addDocument('dim the lights to y percent', 'hue-handler');
//
// classifier.addDocument('play some music', 'spotify-handler');
// classifier.addDocument('play some x', 'spotify-handler');
// classifier.addDocument('play my x playlist', 'spotify-handler');
// classifier.addDocument('play x', 'spotify-handler');
// classifier.addDocument('turn on the music', 'spotify-handler');
// classifier.addDocument('turn off the music', 'spotify-handler');
// classifier.addDocument('turn up the music', 'spotify-handler');
// classifier.addDocument('turn down the music', 'spotify-handler');
//
// classifier.train();
//
// console.log(classifier.classify(input));
