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

function removeFromClub(checkinID, userID){
           Nightclubs.findOne({'nightclub.id':checkinID}, function(err,Nightclub){
            if (err) throw err;
            if(Nightclub){
                //if nightclub is found remove user from array and save.
                console.log ("before remove:" +Nightclub.nightclub.users  );
                var user = Nightclub.nightclub.users.indexOf(userID);
                Nightclub.nightclub.users.splice(user, 1);
                console.log ("after remove:" +Nightclub.nightclub.users  );
                Nightclub.save();
            } else {
                console.log ("nightclub not found - error?")
            }
        });
    
}    
    
function addtoClub(checkinID, userID){
         Nightclubs.findOne({'nightclub.id':checkinID}, function(err,Nightclub){
            if (err) throw err;
            if(Nightclub){
                console.log("nightclub found");
                //if nightclub is found just add user to users array
                console.log ("before add:" +Nightclub.nightclub.users  );
                Nightclub.nightclub.users.push(userID);
                console.log ("after add:" +Nightclub.nightclub.users  );
                Nightclub.save();
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
            
         });
}

app.route('/checkin/:checkinID')
  .get(isLoggedIn, function (req, res) {
       Users.findOne({ 'id': req.id }, function (err, User) {
           console.log("the user is " +User.twitter.id);
            if (err) throw err;x
            if(User){
                console.log("Old location:" + User.nightclub.nightclub);
                if (User.nightclub.nightclub.length >0){
                    removeFromClub(User.nightclub.nightclub, User.twitter.id);
                }
                addtoClub(req.params.checkinID, User.twitter.id);
                User.nightclub.nightclub = req.params.checkinID;
                console.log("New location:" + User.nightclub.nightclub);
                User.save();
            } else{
                console.log ("err no user");
            }
        });
        
 
        
       res.sendFile(path + '/public/checkin.html');
      
  })
}
