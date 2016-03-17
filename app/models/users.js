'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	 twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    nightclub :{
        nightclub: String,
        name: String
    },
    lastSearch : String
});

module.exports = mongoose.model('User', User);
