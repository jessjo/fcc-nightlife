'use strict';

var path = process.cwd();
var Yelp = require('yelp');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var handlebars  = require('handlebars');
var fs = require('fs');
var session = require('express-session');
var Users = require('../models/users.js');
var Nightclubs = require('../models/nightlife.js');



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



function loadIndex(data, res){
     fs.readFile('public/index.html', 'utf-8', function(error, source){
                var template = handlebars.compile(source);
                var html = template(data);
                res.send(html);
           
                }); 
    
}

app.route('/')
		.get(function (req, res) {
		
		   var loggedin;
		   var userloc = "You're not hooting anywhere! Search to find your next hootspot."

            if (req.isAuthenticated()) {
                 loggedin = true;
                 if (req.user.nightclub.name != undefined){
                     if (req.user.nightclub.name.length > 0){
                        userloc = "You're currently hooting at:" +req.user.nightclub.name + ". <a href='/checkout' class='btn'> Checkout</a>";
                     } 

                 }
             } else {
                  loggedin = false;
             }



		   var data = {
                 loggedin: loggedin,
                 accountinfo: userloc
           }
            
         loadIndex(data,res);
            
            
		});


app.post('/',  upload.array(), function (req, res, next) {
		console.log("location:" + req.body["location"]);
		    var loggedin;
		     var userloc = "You're not hooting anywhere! Search to find your next hootspot."

		    if (req.isAuthenticated()) {
                 loggedin = true;
                 if (req.user.nightclub.name != undefined){
                     if (req.user.nightclub.name.length > 0){
                        userloc = "You're currently hooting at:" +req.user.nightclub.name + ". <a href='/checkout' class='btn'> Checkout</a>";
                     } 
                 }
             } else {
                  loggedin = false;
             }
            

   //search yelp for nightlife in the location user requested
		yelp.search({ term: 'nightlife', location: req.body["location"] })
				.then(function (data) {
					var biz="<div>"
					var last = false;
  					for (var i=0; i< data.businesses.length; i++){

                            //all relevant info from API for businesses
                             var url =  data.businesses[i].url;
  						     var name = data.businesses[i].name;
  						     var imgURL = data.businesses[i].image_url;
  					    	 var snippet = data.businesses[i].snippet_text;
  					    	 var id = data.businesses[i].id;
  				            if (i == data.businesses.length -1){
  				                last = true;
  				            }
                             
                            var getTheSearch = function (callback, url, name, imgURL, snippet, id, last, userloc){
                                var partygoers;

  		                         Nightclubs.findOne({ 'nightclub.id': data.businesses[i].id }, function (err, nightclub) {
                                    if (err) throw err;
                                    partygoers = 0;
                                    if(nightclub){
                                        
                                        if(nightclub.nightclub.users > 0){
                                            partygoers = nightclub.nightclub.users.length;
                                        }  
                                        
                                    //TODO add in what to do if I'M going to the nightclub
                                    //if (req.user ...)
                    
                                    } else {
                                        //create new nightclub.
                                         var  newNightclub = new Nightclubs();
                                         newNightclub.nightclub.id = id;
                                         newNightclub.nightclub.users = [];
                                         newNightclub.nightclub.name = name;
                                         console.log (newNightclub.nightclub.name);
                                         newNightclub.save(function (err, doc) {
                                             if (err) { throw err; }
                                        });
                                    }
                                    
                                    //add nightclub this is the only place I get all the data (ex. name)
                                    callback(partygoers, url,name, imgURL, snippet, id, last, userloc);
                                });
                            
                                
                            }   
                        
                            var formatting = function(partygoers, url, name, imgURL, snippet, id, last, userloc){
                                biz+="<div id='biz'><h4><a href='" + url +"'>";
                                biz+= name +"</a></h4>";
  	                            biz+= "<img src='" + imgURL+"'>";
  	                            biz += snippet;
  	                             biz += "<p><b>"+partygoers + " people give a hoot!</b>"
                                biz += "<a href='/checkin/"+id+"' class='btn btn-info'>Hoooot!</a></p>"
  	                             biz +="</div>"
  	                   
  	                   
  	                            if (last){
  	                                var status ="";
  	                                if (loggedin){
  	                                    status = "";
  	                                }
  	                                var data = {
  						                nightlife: biz,
  					            	    loggedin: loggedin,
  					            	    accountinfo: userloc
           		                	}
           		                	
           		            	    loadIndex(data, res);
  	                                
  	                            }
                            }
                            
                            getTheSearch(formatting, url, name, imgURL, snippet, id, last, userloc);
  				        
  		
  					}
  					
  				
  				

  					
				})
			   .catch(function (err) {
  					console.error(err);
  					var data = {
  						                nightlife: "Invalid location, please try another",
  					            	    loggedin: loggedin,
  					            	    accountinfo: userloc
           		                	}
           		                	
           		            	    loadIndex(data, res);
  					
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



