var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User',{
		autokey: { path: 'slug', from: 'email', unique: true }
});

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
	password: { type: Types.Password, initial: true, required: true },
	resetPasswordKey: { type: String, hidden: true },
	source: { type: String },
	oauthID: { type: Number }
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

User.schema.virtual('url').get(function() {
	return '/users'+this.slug;
});

/**
 * Relationships
 */
User.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });

/**
 * Helpers
 */

 User.schema.methods.wasActive = function () {
 	this.lastActiveOn = new Date();
 	return this;
 };


/**
 * Registration
 */
User.defaultColumns = 'name, email, isAdmin';
User.register();
