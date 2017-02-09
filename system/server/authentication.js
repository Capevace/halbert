const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const users = {
  lukas: {
    username: "Lukas",
    password: "12345"
  }
};

passport.use("local-login", new LocalStrategy({
  // by default, local strategy uses username and password, we will override with email
  usernameField: "username",
  passwordField: "password",
  passReqToCallback: true // allows us to pass back the entire request to the callback
}, function(req, username, password, done) {
  // callback with email and password from our form

  if (
    users[username.toLowerCase()] &&
      users[username.toLowerCase()].password === password
  ) {
    return done(null, users[username.toLowerCase()]);
  } else {
    return done(null, false);
  }
}));

passport.serializeUser(function(user, done) {
  done(null, user.username.toLowerCase());
});

passport.deserializeUser(function(name, done) {
  done(null, users[name.toLowerCase()]);
});
