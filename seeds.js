var mongoose = require("mongoose");
var Campground = require("./models/campgrounds");
var Comment = require("./models/comments")
var data = [
    {
        name : "Cloud's Rest",
        image : "http://photosforclass.com/download/5641024448",
        description : "took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        startDate: "11/17/2018",
        endDate: "11/21/2018",
        price : 4000,
        ratings : 3,
        
    },
    {
        name : "Mountains Rest",
        image : "https://farm4.staticflickr.com/3270/2617191414_c5d8a25a94.jpg",
        description : "took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    {
        name : "Magic Camps",
        image : "https://farm7.staticflickr.com/6191/6093778029_80248222df.jpg",
        description : "took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    }
];

function seedDB(){
    Campground.remove({},function(err){
    if (err)
        console.log(err);
    else
    {
        console.log("removed camps");
        data.forEach(function(seed){
        Campground.create(seed , function(err,campground){
            if (err)
            {
                console.log(err);
            }
            else
            {
                console.log("added a campground");
                Comment.create({
                   text:"This place is awesomeee!!!!",
                   author:"Homer"
                }, function(err, comment){
                    if (err)
                        console.log(err);
                    else
                    {
                        campground.comments.push(comment);
                        campground.save();
                    }
                });
            }
        });
    });    
    }        
        
    });
    
    
}

module.exports = seedDB;