//TO BE DELETED !!!!!!!!!!!!!!!!!!!!!!!
var keystone = require('keystone'),
  async = require('async'),
  config = require('../../../oauth.js'),
  passport = require('passport'),
  GoogleStrategy = require('passport-google-oauth2').Strategy;

exports = module.exports = function (req, res) {

  if (req.user) {
    return res.redirect('/blog');
  }

  var view = new keystone.View(req, res),
    locals = res.locals;

  locals.section = 'createaccount_social';
  locals.form = req.body;

  view.on('GET', function (next) {

    switch (req.params.provider) {
      case 'google':
        if (req.params.callback == 'join') {
          passport.authenticate('google', {
            scope: [
              'https://www.googleapis.com/auth/plus.login',
              'https://www.googleapis.com/auth/plus.profile.emails.read'
            ]
          });
          return next();
        } else {
          passport.authenticate('google', { failureRedirect: '/' }),
            function (req, res) {
              res.redirect('/blog');
            }
        }
        next();
        // break;
      case '':
        break;
      default:
        break;
    }

  });

  // Google
passport.use(new GoogleStrategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
      passReqToCallback: true
    },
      function (request, accessToken, refreshToken, profile, done) {
        User.findOne({ oauthID: profile.id }, function (err, user) {
          if (err) {
            console.log(err);  // handle errors!
          }
          if (!err && user !== null) {
            done(null, user);
          } else {
            var User = keystone.list('User').model;
            user = new User({
              oauthID: profile.id,
              name: profile.displayName,
              email: profile.email,
              photoURL: profile.photos[0].value,
              src: 'goog',
              created: Date.now()
              //todo: hope to idenfiy the Oauth provider with the oauthID
            });
            user.save(function (err) {
              if (err) {
                console.log(err);  // handle errors!
              } else {
                console.log("saving user ...");
                done(null, user);
              }
            });
          }
        });
      }
    ));


  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
      if (!err) done(null, user);
      else done(err, null);
    });
  });

  // view.render('auth/join');
}