'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Nightclub = new Schema({
	 nightclub         : {
        name          : String,
        id       : String,
        users  : [String]
    }
});

module.exports = mongoose.model('Nightclub', Nightclub);