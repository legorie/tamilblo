var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User',{
		autokey: { path: 'slug', from: 'email', unique: true }
});

var deps = {
	github: { 'services.github.isConfigured': true },
	facebook: { 'services.facebook.isConfigured': true },
	google: { 'services.google.isConfigured': true },
	twitter: { 'services.twitter.isConfigured': true }
}


User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
	password: { type: Types.Password, initial: true, required: true },
	resetPasswordKey: { type: String, hidden: true },
	source: { type: String },
	oauthID: { type: Number }
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
}, 'Services', {
	services: {
		facebook: {
			isConfigured: { type: Boolean, label: 'Facebook has been authenticated' },
			profileId: { type: String, label: 'Profile ID', dependsOn: deps.facebook },
			username: { type: String, label: 'Username', dependsOn: deps.facebook },
			avatar: { type: String, label: 'Image', dependsOn: deps.facebook },
			accessToken: { type: String, label: 'Access Token', dependsOn: deps.facebook },
			refreshToken: { type: String, label: 'Refresh Token', dependsOn: deps.facebook }
		},
		google: {
			isConfigured: { type: Boolean, label: 'Google has been authenticated' },
			profileId: { type: String, label: 'Profile ID', dependsOn: deps.google },
			username: { type: String, label: 'Username', dependsOn: deps.google },
			avatar: { type: String, label: 'Image', dependsOn: deps.google },
			accessToken: { type: String, label: 'Access Token', dependsOn: deps.google },
			refreshToken: { type: String, label: 'Refresh Token', dependsOn: deps.google }
		},
		twitter: {
			isConfigured: { type: Boolean, label: 'Twitter has been authenticated' },
			profileId: { type: String, label: 'Profile ID', dependsOn: deps.twitter },
			username: { type: String, label: 'Username', dependsOn: deps.twitter },
			avatar: { type: String, label: 'Image', dependsOn: deps.twitter },
			accessToken: { type: String, label: 'Access Token', dependsOn: deps.twitter },
			refreshToken: { type: String, label: 'Refresh Token', dependsOn: deps.twitter }
		}
	}
}
);

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

User.schema.virtual('url').get(function() {
	return '/users'+this.slug;
});

// Pull out avatar image
User.schema.virtual('avatarUrl').get(function() {
	if (this.photo.exists) return this._.photo.thumbnail(120,120);
	if (this.services.github.isConfigured && this.services.github.avatar) return this.services.github.avatar;
	if (this.services.facebook.isConfigured && this.services.facebook.avatar) return this.services.facebook.avatar;
	if (this.services.google.isConfigured && this.services.google.avatar) return this.services.google.avatar;
	if (this.services.twitter.isConfigured && this.services.twitter.avatar) return this.services.twitter.avatar;
	if (this.gravatar) return 'http://www.gravatar.com/avatar/' + this.gravatar + '?d=http%3A%2F%2Fsydjs.com%2Fimages%2Favatar.png&r=pg';
});

// Usernames
User.schema.virtual('twitterUsername').get(function() {
	return (this.services.twitter && this.services.twitter.isConfigured) ? this.services.twitter.username : '';
});
User.schema.virtual('githubUsername').get(function() {
	return (this.services.github && this.services.github.isConfigured) ? this.services.github.username : '';
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
