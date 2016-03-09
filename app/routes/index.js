'use strict';

var path = process.cwd();
var Yelp = require('yelp');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var handlebars  = require('handlebars');
var fs = require('fs');


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
	
		var data = {
           }
    //loads index with no nightlife data
        fs.readFile('public/index.html', 'utf-8', function(error, source){
                var template = handlebars.compile(source);
                var html = template(data);
                res.send(html);
           
                }); 
		});

app.post('/',  upload.array(), function (req, res, next) {
		console.log("location:" + req.body["location"]);
		yelp.search({ term: 'nightlife', location: req.body["location"] })
				.then(function (data) {
					var biz="<div>"
  					for (var i=0; i< data.businesses.length; i++){
  						biz+="<div id='biz'><h4><a href='" +data.businesses[i].url +"'>";
  						biz+= data.businesses[i].name+"</a></h4>";
  						biz+= "<img src='" + data.businesses[i].image_url+"'>";
  						biz += data.businesses[i].snippet_text;
  					}
  					biz +="</div>"
  					
  					
  					var data = {
  						nightlife: biz
           			}
           			
  					fs.readFile('public/index.html', 'utf-8', function(error, source){
            			 var template = handlebars.compile(source);
                		 var html = template(data);
                		 res.send(html);
               		}); 
  					
				})
			   .catch(function (err) {
  					console.error(err);
				});

});




};
