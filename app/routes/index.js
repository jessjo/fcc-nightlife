'use strict';

var path = process.cwd();
var Yelp = require('yelp');

module.exports = function (app, passport) {
/** save
	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}
**/

	app.route('/')
		.get(function (req, res) {
			console.log(req.headers['x-forwarded-for']);
			res.sendFile(path + '/public/index.html');
		});





};
