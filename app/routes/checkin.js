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

function removeFromClub(checkinID){
           Nightclubs.findOne({'id':checkinID}, function(err,Nightclub){
            if (err) throw err;
            if(Nightclub){
                
            } else {
                
            }
        });
    
}    
    
function addtoClub(checkinID, userID){
    
}

app.route('/checkin/:checkinID')
  .get(isLoggedIn, function (req, res) {
    //  console.log(req.user);
      
       Users.findOne({ 'id': req.id }, function (err, User) {
            if (err) throw err;
            if(User){
                console.log("Old location:" + User.nightclub.nightclub);
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
