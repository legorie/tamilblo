/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
var _ = require('lodash');
var keystone = require('keystone');


/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function (req, res, next) {
	var locals = res.locals;

	locals.navLinks = [
		{ label: 'Home', key: 'home', href: '/' },
		{ label: 'Blog', key: 'blog', href: '/blog' },
		{ label: 'Gallery', key: 'gallery', href: '/gallery' },
		{ label: 'Contact', key: 'contact', href: '/contact' },
	];
	locals.user = req.user;

	locals.basedir = keystone.get('basedir');

	locals.page = {
		title: 'TamilThunukku',
		path: req.url.split("?")[0] // strip the query - handy for redirecting back to the page
	};

	if (req.cookies.target && req.cookies.target == locals.page.path) res.clearCookie('target');

	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages, function (msgs) { return msgs.length; }) ? flashMessages : false;
	next();
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
};

// Adding admin middleware

exports.isAdmin = function(req, res,next) {
	if (!req.user){
		req.flash('error','Please sign in to access this page');
		res.redirect('/signin');
	} else if (!req.user.isAdmin) {
			req.flash('error','User does not belog to Admin group');
			res.redirect('/');
	} else {
			next();
	}
}
