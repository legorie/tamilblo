var keystone = require('keystone'),
  User = keystone.list('User'),
  Email = require('keystone-email');

// var nodemailerConfig = require('./test.config.js');
var template = 'simple';
var templateOptions = require('../../../templates/emails/' + template + '/options');
var templatePath = './templates/emails/' + template + '/template.pug';
var mailgunApiKey = process.env.MAILGUN_API_KEY;
var mailgunDomain = process.env.MAILGUN_DOMAIN;

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);

  view.on('post', function (next) {

    if (!req.body.email) {
      req.flash('error', {detail:"Please enter an email address."});
      return next();
    }

    User.model.findOne().where('email', req.body.email).exec(function (err, user) {
      if (err) return next(err);
      if (!user) {
        req.flash('error', {detail:"Sorry, That email address is not registered in our application."});
        return next();
      }

      user.resetPasswordKey = keystone.utils.randomString([16, 24]);

      // to = user.email;
      // var toArray = [
      //   to,
      //   { name: 'Test Recipient', email: to.split('@').join('+1@'), vars: { testVar: 'Our test variable' } },
      //   { name: { first: 'Test First', last: 'Test Last' }, email: to.split('@').join('+2@') },
      // ];

      templateOptions.variable = '/resetpassword/' + user.resetPasswordKey;
      user.save(function (err) {
        if (err) return next(err);  //todo: to complete
        //new Email(template, options);
        Email.send(
          // template path
          templatePath,
          // Email options
          {
            // transport: 'nodemailer',
            transport: 'mailgun',
          },
          // Template locals
          templateOptions,
          // Send options
          {
            // to: toArray,
            to: user.email,
            subject: 'Reset your Password',
            from: { name: 'Admin TamilThunukku', email: 'nirvagi.tamilthunukku@gmail.com' },
            apiKey: mailgunApiKey,
			      domain: mailgunDomain
          },
          // callback
          function (err, result) {
            if (err) {
              console.error('🤕 Mailgun test failed with error:\n', err);
              req.flash('error', {detail:'Error sending reset password email!'});
            next();
            } else {
              console.log('📬 Successfully sent Mailgun test with result:\n', result);
              req.flash('success', {detail:'We have emailed you a link to reset your password'});
          res.redirect('/signin');
            }
          }
        );
        /*
        new keystone.Email({ 'templateName': 'forgotpassword', 'templateExt': 'hbs' }).send({
          user: user,
          link: '/resetpassword/' + user.resetPasswordKey,
          subject: 'Reset your Password',
          to: user.email,
          from: {
            name: 'IncTicket',
            email: 'info@incticket.com'
          }
      }, function (err) {
        if (err) {
          console.error(err);
          req.flash('error', 'Error sending reset password email!');
          next();
        } else {
          req.flash('success', 'We have emailed you a link to reset your password');
          res.redirect('/signin');
        }
      }); */
    });
  });

});

view.render('auth/forgotpassword');

}