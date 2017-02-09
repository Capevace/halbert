const path = require('path');
const _db = require('underscore-db');
const lowdb = require('lowdb');
const database = lowdb(path.resolve(__dirname, 'database.json'), {
  storage: require('lowdb/lib/file-async')
});

database._.mixin(_db);

database
  .defaults({
    widgets: [],
    modules: {}
  })
  .value();

module.exports = database;
