const config = require('../config');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log(username, password);
    if (username === 'Lukas' && password === '12345'){
      console.log('ttt');
      return done(null, { username, password });
    }else
      return done(null, false);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(name, done) {
  return {name};
});
