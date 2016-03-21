'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var checkins = require('./app/routes/checkin.js');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var path = require('path')
var cookieParser = require('cookie-parser')

var app = express();
app.use('/public', express.static(process.cwd() + '/public'));

require('dotenv').load();
require('./app/config/passport')(passport);

app.use(session({
    secret: 'superdupersecretclubhouse',
    resave: false,
    saveUninitialized: true,
    cookie : { httpOnly: true, maxAge: 2419200000, search:"empty" }
}));

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());



mongoose.connect(process.env.MONGO_URI);



routes(app, passport);
checkins(app, passport);

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});
