'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var Yelp = require('yelp');

var app = express();

app.use(session({
    secret: 'secretpassword',
    resave: false,
    saveUninitialized: true
}));
	app.use(passport.initialize());
	app.use(passport.session());
	

require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);



routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});


