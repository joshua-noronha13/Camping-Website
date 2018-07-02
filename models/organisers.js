var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
mongoose.Promise = global.Promise;

var OrganiserSchema = new mongoose.Schema({
    username: String,
    password: String
});

OrganiserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("Organiser", OrganiserSchema);