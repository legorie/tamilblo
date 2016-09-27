var keystone = require('keystone'),
  async = require('async');

exports = module.exports = function (req, res) {

  if (req.user) {
    return res.redirect('/blog');
  }

  var view = new keystone.View(req, res),
      locals = res.locals;

  locals.section = 'createaccount';
  locals.form = req.body;

  view.on('post', function (next) {

    async.series([
      function (cb) {
        if ( !req.body.firstname || !req.body.lastname || !req.body.email || !req.body.password) {
          req.flash('error', {detail:'Please enter your name, email and password.'});
          return cb(true);
        }
        return cb();
      },

      // function (cb) { //https://github.com/manikantapanati/incticket
      //   keystone.list('User').model.findOne({ username: req.body.username }, function (err, user) {
      //     if (err || user) {
      //       req.flash('error', {detail:'User already exists with that Username.'});
      //       return cb(true);
      //     }
      //     return cb();
      //   });
      // },

      function (cb) {
        keystone.list('User').model.findOne({ email: req.body.email }, function (err, user) {
          if (err || user) {
            req.flash('error', {detail:'User already exists with that email address.'});
            return cb(true);
          }
          return cb();
        });
      },

      function (cb) {
        var userData = {
          // username: req.body.username,
          name: {
            first: req.body.firstname,
            last: req.body.lastname,
          },
          email: req.body.email,
          password: req.body.password,
          isAdmin: false,
          origin: 'tt'
        };
        var User = keystone.list('User').model,
          newUser = new User(userData);
          newUser.save(function (err) {
          return cb(err);
        });
      }
    ], function (err) {
      if (err) return next();
      var onSuccess = function () {
        res.redirect('/blog');
      }

      var onFail = function (e) {
        req.flash('error', {detail:'There was a problem signing you up, please try again.'});
        return next();
      }

      keystone.session.signin({ email: req.body.email, password: req.body.password }, req, res, onSuccess, onFail);
    });
  });
  view.render('auth/join');
}