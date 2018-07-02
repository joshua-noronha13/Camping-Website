var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var campgroundSchema = new mongoose.Schema({
    name:String,
    image:String,
    description:String,
    startDate:String,
    endDate:String,
    location:String,
    price:Number,
    organiser: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
});

module.exports = mongoose.model("Campground", campgroundSchema); 
