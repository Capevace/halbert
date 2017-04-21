// A lot of this code is extracted from the adaptjs npm module.
// It was heavily modified to fit this usecase.

const uuid = require('uuid-1345');
const IntentParser = require('./IntentParser');
const Intent = require('./Intent');
const Entity = require('./Entity');

const intentKey = uuid.v4();
const intentParser = new IntentParser(intentKey);

module.exports = {
  intentParser,
  intentKey
};
