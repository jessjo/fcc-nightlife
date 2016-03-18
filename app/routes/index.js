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

function performLocSearch(req, res,loggedin, userloc, locID, location){
    		yelp.search({ term: 'nightlife', location: location })
				.then(function (data) {
					var biz="<div class = 'col-xs-12'>"
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
                             
                            var getTheSearch = function (callback, url, name, imgURL, snippet, id, last, userloc, locID){
                                var partygoers = 0;

  		                         Nightclubs.findOne({ 'nightclub.id': data.businesses[i].id }, function (err, nightclub) {
                                    if (err) throw err;
                           
                                    if(nightclub){
                                        console.log(nightclub.nightclub.users);
                                        if(nightclub.nightclub.users.length >= 1){
                                            partygoers = nightclub.nightclub.users.length;
                                            console.log(partygoers);
                                             callback(partygoers, url,name, imgURL, snippet, id, last, userloc,locID);
                                        }  else {
                                             callback(partygoers, url,name, imgURL, snippet, id, last, userloc,locID);
                                        }
                                        
                                   
                    
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
                                         callback(partygoers, url,name, imgURL, snippet, id, last, userloc,locID);
                                    }
                                    
                                    //add nightclub this is the only place I get all the data (ex. name)
                                   
                                });
                            
                                
                            }   
                        
                            var formatting = function(partygoers, url, name, imgURL, snippet, id, last, userloc, locID){
                                biz+="<div class='biz well'><div class='row'><div class='col-xs-1'></div><div class='col-xs-3'><h4><a href='" + url +"'>";
                                biz+= name +"</a></h4>";
  	                            biz+= "<img src='" + imgURL+"'></div><div class='col-xs-6'><br/><br/>";
  	                            biz += snippet;
  	                            biz += "<p><b>"+partygoers + " people give a hoot!</b>"
  	                            if (locID){
      
  	                                if (id == locID.nightclub){
  	                                     biz+= " (including you!)"
  	                                }
  	                            }
                                biz += "    <a href='/checkin/"+id+"' class='btn'>Hoooot!</a></p></div>"
  	                             biz +="<div class='col-xs-2'></div></div></div>"
  	                   
  	                   
  	                            if (last){
  	                                var status ="";
  	                                if (loggedin){
  	                                    status = "";
  	                                }
  	                                var data = {
  						                nightlife: biz,
  					            	    loggedin: loggedin,
  					            	    accountinfo: userloc,
  					            	    search: location
           		                	}
           		                	
           		            	    loadIndex(data, res);
  	                                
  	                            }
                            }
                            
                            getTheSearch(formatting, url, name, imgURL, snippet, id, last, userloc, locID);
  				        
  		
  					}
  					
  				
  				

  					
				})
			   .catch(function (err) {
  					console.error(err);
  					var data = {
  						                nightlife: "<p>We can't find anything at this location, Hoot on somewhere else. </p>",
  					            	    loggedin: loggedin,
  					            	    accountinfo: userloc
           		                	}
           		                	
           		            	    loadIndex(data, res);
  					
				});

    
}

app.route('/')
		.get(function (req, res) {
		
		   var loggedin;
		   var userloc = "You're not hooting anywhere! Search to find your next hootspot."
           var search = "Enter a location to search";
            if (req.isAuthenticated()) {
                 loggedin = true;
                 console.log(req.user);
                 if (req.user.nightclub.name != undefined){

                     if (req.user.nightclub.name.length > 0){
                         
                        userloc = "You're currently hooting at: <b>" +req.user.nightclub.name + "</b>. <a href='/checkout' class='btn'> Checkout</a>";
                         search = req.user.lastSearch;
                         var locID = req.user.nightclub;
                         
                     } 

                 }
             } else {
                  loggedin = false;
             }



		   var data = {
                 loggedin: loggedin,
                 accountinfo: userloc,
                 search: search
           }
         if (loggedin && req.user.lastSearch != undefined ){
             if (req.user.lastSearch.length >0){
                console.log ("am I logged in" + loggedin)
                performLocSearch(req, res,loggedin,userloc, locID, req.user.lastSearch);
             }
         } else {
            loadIndex(data,res);
         }
            
            
		});


app.post('/',  upload.array(), function (req, res, next) {
		console.log("location:" + req.body["location"]);
		    var loggedin,locID;
		     var userloc = "You're not hooting anywhere! Search to find your next hootspot."

		    if (req.isAuthenticated()) {
                 loggedin = true;
                 if (req.user.nightclub.name != undefined){
                     if (req.user.nightclub.name.length > 0){
                        userloc = "You're currently hooting at: <b>" +req.user.nightclub.name + "</b>. <a href='/checkout' class='btn'> Checkout</a>";
                        locID = req.user.nightclub;
                        req.user.lastSearch = req.body["location"];
                        req.user.save();
                     } 
                 }
             } else {
                  loggedin = false;
             }
            

   //search yelp for nightlife in the location user requested
   performLocSearch(req, res,loggedin,userloc, locID, req.body["location"]);

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



