'use strict';

var path = process.cwd();
var Yelp = require('yelp');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var handlebars  = require('handlebars');
var fs = require('fs');
var session = require('express-session');
var Users = require('../models/users.js');




module.exports = function (app, passport) {

//Express middleware checks log in status
function isLoggedIn (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/login');
        }
    }
    
//Yelp keys
var yelp = new Yelp({
  consumer_key: process.env.YELP_KEY,
  consumer_secret: process.env.YELP_SECRET,
  token: process.env.YELP_TOKEN,
  token_secret: process.env.YELP_TOKEN_SECRET,
});



	app.route('/')
		.get(function (req, res) {
		   var loggedin;
             if (req.isAuthenticated()) {
                 loggedin = true;
             } else {
                  loggedin = false;
             }
//	console.log(req.session.passport.user)
		var data = {
                loggedin: loggedin
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
	
	//	console.log("user" + res.user);

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
  						nightlife: biz,
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

app.route('/login')
    .get(function (req, res) {
        res.sendFile(path + '/public/login.html');
    });
    
app.route('/logout')
    .get(function (req, res) {
        req.logout();
        res.redirect('/login');
    });
    
app.route('/auth/twitter')
    .get(passport.authenticate('twitter'));
    
app.route('/auth/twitter/callback')
    .get(passport.authenticate('twitter', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));


};




