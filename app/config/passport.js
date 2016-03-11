'use strict';

var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function (passport) {


    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });



    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
    
    
    passport.use(new TwitterStrategy({
        consumerKey: process.env.TWITTER_KEY,
        consumerSecret: process.env.TWITTER_SECRET,
        callbackURL: process.env.APP_URL + 'auth/twitter/callback'
    },
    function (token, refreshToken, profile, done) {
        process.nextTick(function () {
            User.findOne({ 'twitter.id': profile.id }, function (err, user) {
                if (err) {
                    return done(err);
                }

                if (user) {
                    return done(null, user);
                }else {
                    var newUser = new User();

                    newUser.twitter.id = profile.id;
                    newUser.twitter.username = profile.username;
                    newUser.twitter.displayName = profile.displayName;
                    newUser.twitter.token = token;
                    newUser.nightclub.nightclub = "";

                    newUser.save(function (err) {
                        if (err) {
                            throw err;
                        }

                        return done(null, newUser);
                    });
                }
            });
        });
}));


};