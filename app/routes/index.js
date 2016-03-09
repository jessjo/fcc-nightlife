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
var yelp = new Yelp({
  consumer_key: process.env.YELP_KEY,
  consumer_secret: process.env.YELP_SECRET,
  token: process.env.YELP_TOKEN,
  token_secret: process.env.YELP_TOKEN_SECRET,
});

	app.route('/')
		.get(function (req, res) {
			console.log(req.headers['x-forwarded-for']);
			
			yelp.search({ term: 'food', location: 'Montreal' })
				.then(function (data) {
  					console.log(data);
				})
			   .catch(function (err) {
  					console.error(err);
				});

			res.sendFile(path + '/public/index.html');
		});





};
