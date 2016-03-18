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

function isLoggedIn (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/login');
        }
    }

function removeFromClub(User, checkinID, userID, newcheckIN, res, callback){
         
           Nightclubs.findOne({'nightclub.id':checkinID}, function(err,Nightclub){
            if (err) throw err;
            if(Nightclub){
                //only check to remove if users are present
                 if (Nightclub.nightclub.users.length >0){ 
                //if nightclub is found remove user from array and save.
                    console.log ("before remove:" +Nightclub.nightclub.users  );
                    var user = Nightclub.nightclub.users.indexOf(userID);
                    //only remove if user is found
                    if (user >= 0){
                        Nightclub.nightclub.users.splice(user, 1);
                        console.log ("after remove:" +Nightclub.nightclub.users  );
                        Nightclub.save();
                    }
                 }
            } else {
                console.log ("nightclub not found - error?")
            }
        });
        
    callback(User, newcheckIN, userID, res);
}    
    
function addtoClub(User, checkinID, userID, res){
         Nightclubs.findOne({'nightclub.id':checkinID}, function(err,Nightclub){
            if (err) throw err;
             var data;
            if(Nightclub){
                console.log("nightclub found");
                //if nightclub is found just add user to users array
                console.log ("before add:" +Nightclub.nightclub.users  );
                Nightclub.nightclub.users.push(userID);
                console.log ("after add:" +Nightclub.nightclub.users  );
                
                //sets name of user's nightclub equal to new checkin
                User.nightclub.name = Nightclub.nightclub.name;
                User.save();
                Nightclub.save();
                data = {
                    body: "<div>You're hooting at: "+Nightclub.nightclub.name+"</div>"
                }
            } else {
               // create new nightclub object 
               console.log("nightclub not found");
               var  newNightclub = new Nightclubs();
               newNightclub.nightclub.id = checkinID;
               newNightclub.nightclub.users = [userID];
               console.log (newNightclub.nightclub.users);
                newNightclub.save(function (err, doc) {
                     if (err) { throw err; }
                });
                console.log (newNightclub);
            }
            
                //loads index with no nightlife data
                fs.readFile('public/checkin.html', 'utf-8', function(error, source){
                    var template = handlebars.compile(source);
                    var html = template(data);
                    res.send(html);
           
                }); 
            
         });
}

app.route('/checkin/:checkinID')
  .get(isLoggedIn, function (req, res) {
       console.log(req.user);
       console.log("Old location:" + req.user.nightclub.nightclub);
       removeFromClub(req.user, req.user.nightclub.nightclub, req.user.twitter.id, req.params.checkinID, res, addtoClub);
       req.user.nightclub.nightclub = req.params.checkinID;
       console.log("New location:" + req.user.nightclub.nightclub);
       req.user.save();
	
      
  })
  
  app.route('/checkout')
  .get(isLoggedIn, function (req, res) {
      Users.findOne({ 'id': req.id }, function (err, User) {
          if (err) throw err;
          if(User){
              User.nightclub.nightclub = "";
              User.nightclub.name = "";
              User.save();
          }
          res.redirect('/')
      });
      
  });
}
