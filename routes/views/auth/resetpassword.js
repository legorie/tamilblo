var keystone = require('keystone'),
	User = keystone.list('User');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res),
		locals = res.locals;
	
	view.on('init', function(next) {
		
		User.model.findOne().where('resetPasswordKey', req.params.key).exec(function(err, userFound) {
			if (err) return next(err);
			if (!userFound) {
				req.flash('error', {detail:"Sorry, that reset password key isn't valid."});
				return res.redirect('/forgotpassword');
			}
			locals.key =  req.params.key;
			next();
		});
		
	});
	
	view.on('post', function(next) {
		console.log('locals');
        console.log(locals);
		if (!req.body.password || !req.body.password_confirm) {
			req.flash('error', {detail:"Please enter, and confirm your new password."});
			return res.redirect('/resetpassword/'+locals.key);
		}
		
		if (req.body.password != req.body.password_confirm) {
			req.flash('error', {detail:'Please make sure both passwords match.'});
			return res.redirect('/resetpassword/'+locals.key);
		}
		
        User.model.findOne().where('resetPasswordKey', req.body.resetkey).exec(function(err, userFound) {
			if (err) return next(err);
			userFound.password = req.body.password;
           userFound.resetPasswordKey = '';
            userFound.save(function(err) {
                if (err) return next(err);
                req.flash('success', {detail:'Your password has been reset, please sign in.'});
                res.redirect('/signin');
            });
		});
         
	});
	
	view.render('auth/resetpassword');
};