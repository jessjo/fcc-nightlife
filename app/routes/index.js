'use strict';

var path = process.cwd();
var Yelp = require('yelp');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

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
		//	console.log(req.headers['x-forwarded-for']);
			console.log("index loaded")
		
			res.sendFile(path + '/public/index.html');
		});

app.post('/',  upload.array(), function (req, res, next) {
		console.log("location:" + req.body["location"]);
		yelp.search({ term: 'nightlife', location: req.body["location"] })
				.then(function (data) {
					var html="<div>"
  					for (var i=0; i< data.businesses.length; i++){
  						html+="<h4>"+data.businesses[i].name+"</h4>";
  						console.log(data.businesses[i].snippet_image_url);
  						console.log(data.businesses[i].snippet_text);
  						console.log(data.businesses[i].url);
  					}
  					html +="</div>"
				})
			   .catch(function (err) {
  					console.error(err);
				});

});




};
