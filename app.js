var express         =   require("express"),
    app             =   express(),
    bodyParser      =   require("body-parser"),
    mongoose        =   require("mongoose"),
    Campground      =   require("./models/campgrounds"),
    User            =   require("./models/user"),
    Comment         =   require("./models/comments"),
    seedDB          =   require("./seeds.js"),
    passport        =   require("passport"),
    flash           =   require("connect-flash"),
    session         =   require("express-session"),
    async           =   require("async"),
    crypto          =   require("crypto"),
    nodemailer      =   require("nodemailer"),
    LocalStrategy   =   require("passport-local"),
    methodOverride  =   require("method-override"),
    ExpressValidator=   require("express-validator"),
    ExpressSession  =   require("express-session"),
    PassportLocalMongoose = require("passport-local-mongoose"),
    request         = require("request"),
    handlebars      =    require("handlebars");
    const xoauth2    =   require("xoauth2");
    
    const Nexmo = require('nexmo');
    const nexmo = new Nexmo({
    apiKey: ,
    apiSecret: 
    });
    
    

 
mongoose.connect("mongodb://localhost/camp",{
    useMongoClient: true,
});

//seedDB();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(ExpressValidator());
//app.use(ExpressSession({secret : 'max',saveUninitialized : false, resave : false}));
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret:,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});
const fileUpload = require('express-fileupload');

//=========================
//MAIN PAGE
//=========================

app.get("/",function (req,res){
   res.render("landing"); 
});


app.get("/aboutus",function(req, res) {
    res.render("about");
});


//=========================
//Comment Routes
//=========================

app.get("/campgrounds/:id/comments/new",isUserLoggedIn,  function(req, res){
    // find campground by id
    console.log(req.params.id);
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("new-comment", {campground: campground});
        }
    })
});


app.post("/campgrounds/:id/comments",isUserLoggedIn,function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id,function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
               console.log(comment);
               req.flash('success', 'Created a comment!');
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
});

app.get("/campgrounds/:id/comments/:commentId/edit",isUserLoggedIn,  function(req, res){
    // find campground by id
    Comment.findById(req.params.commentId, function(err, comment){
        if(err){
            console.log(err);
        } else {
             res.render("edit-comment", {campground_id: req.params.id, comment: comment});
        }
    })
});

app.put("/campgrounds/:id/comments/:commentId", function(req, res){
   Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
       if(err){
           res.render("edit");
       } else {
           res.redirect("/campgrounds/" + req.params.id);
       }
   }); 
});

app.delete("/campgrounds/:id/comments/:commentId", function(req, res){
    Comment.findByIdAndRemove(req.params.commentId, function(err){
        if(err){
            console.log("PROBLEM!");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});


//==========================
//CAMPGROUNDS ROUTES
//==========================

app.get("/campgrounds",function(req, res) {
   Campground.find({},function(err,allCampgrounds)
    {
        if (err)
            console.log("Error");
        else
            res.render("campgrounds",{campground:allCampgrounds});
    });
});

app.get("/campgrounds/new",isOrganiserLoggedIn,function(req, res) {
   res.render("upload-camp"); 
});

app.get("/campgrounds/:id/edit", function(req, res){
    console.log("IN EDIT!");
    //find the campground with provided ID
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("error","No such camp exists!");
        } else {
            //render show template with that campground
            res.render("edit-campgrounds", {campground: foundCampground});
        }
    });
});
app.get("/campgrounds/:id",function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("display", {campground:foundCampground});
        }    
        
    });
});
app.put("/campgrounds/:id",isOrganiserLoggedIn, function(req, res){
    var newData = {name: req.body.name, image: req.body.image, description: req.body.desc,startDate:req.body.start,
    endDate:req.body.end,location:req.body.loc};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});
app.delete("/campgrounds/:id", function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error","Error!");
            res.redirect("/");
        } else {
            req.flash("success","Successfully Deleted!");
            res.redirect("/campgrounds");
        }
    })
});

app.post("/campgrounds",isOrganiserLoggedIn,function (req, res, next) {
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var startDate = req.body.start;
    var endDate = req.body.end;
    var price = req.body.price;
    var location = req.body.location;
    var organiser = {
        id : req.user._id,
        username : req.user.username
    }
    var newCampground = {name:name , image:image , description: description, startDate:startDate, endDate:endDate,location:location,
    price:price,organiser:organiser}
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
        });
});



//=======================
//User Routes
//=======================

app.get("/login",function(req, res) {
   res.render("intermediate"); 
});
app.get("/login/user",function(req, res) {
   res.render("login-user"); 
});
app.get("/login/forgot",function(req, res) {
    res.render("forgot");
});

app.get("/forgot/user",function(req, res) {
    res.render("forgot.ejs")    
});

app.get("/reset",function(req, res) {
    res.render("reset");    
});
app.post("/reset",function(req, res) {
     User.findOne({name:req.user},function(err, oldUser) {
         if (err)
         {
             req.flash("error","Something went wrong");
             res.redirect("/reset");
         }
         else
         {
             User.findByIdAndRemove(req.params.id,function(err) {
                 if (err)
                 {
                     res.redirect("/")
                 }
             });
             User.register(oldUser, req.body.password, function(err, user){
            if(err){
            req.flash("error", err.message);
            console.log(req.user.username);
            console.log(err);
            return res.redirect("/login");
            }
         });
     }
 });
});

app.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (err) {
            console.log("No user");
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: '',
          pass: ''
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'CAMPSTOP Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) 
    res.redirect('/forgot');
  });
});



//verification
app.post("/verify",function(req, res) {
    
    let pin = req.body.pin;
    let requestId = req.body.requestId;
    var phone = req.body.phone;
    var newUser = req.body.newUser;
    nexmo.verify.check({request_id: requestId, code: pin}, (err, result) => {
    if(err) {
      res.render('status', {message: 'Server Error'});
    } else {
      console.log(result);
      if(result && result.status == '0') 
      {
        req.flash("success","Successfully Registered!");
        res.redirect("/")
      } else {
        // handle the error - e.g. wrong PIN
        req.flash("error","Error!");
      }
    }
  });
});



 app.post("/register/user",captcha, function(req, res){
    var ph = "91"+req.body.phone;
    var newUser = new User({username: req.body.username, role:"user",phone:req.body.phone,email:req.body.email});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            //console.log(user.username);
            console.log(err);
            return res.redirect("/login");
        }
        else
        {
            passport.authenticate("local")(req, res, function(){
        //sms verification
        let phone = "91"+req.body.phone;
        console.log(phone);
        nexmo.verify.request({number: phone, brand: 'Campstop Company'}, (err, 
        result) => {
            console.log(result);
        if(err) {
          req.flash("error","Error 500");
          res.redirect("/login");
        } else {
          let requestId = result.request_id;
          if(result.status == '0') {
              /*var mailOptions = {
            from: '',
            to: 'newUser.email',
            subject: 'Welcome to Campstop',
            text: 'You have successfully signed up'
            }
            
        transporter.sendMail(mailOptions, function (err, res) {
        if(err){
        console.log('Error');
    } else {
        console.log('Email Sent');
    }
    })*/
            res.render('verify', {requestId: requestId, phone:phone, newUser}); // Success! Now, have your user enter the PIN
          } else {
            req.flash("error","Nexmo Error");
          }
        }
      });
    });    
    }
    });
    
    
    


    
});



app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){
});


//==============================
//Organiser Routes
//==============================

app.get("/register/organiser",function (req,res){
   res.render("register-organiser");     
});

app.post("/register/organiser",captcha, function(req, res){
    var newUser = new User({username: req.body.username, role:"organiser"});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.render("register-organiser");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to CampStop!! " + user.username);
           res.redirect("/campgrounds"); 
        });
    });
});
app.get("/login/organiser",function(req,res){
    res.render("login-organiser");    
});

app.post("/login/organiser", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "back"
    }), function(req, res){
});

//=================
//Logout
//=================
app.get("/logout", function(req, res){
   req.logout();
   req.flash("Success", "Logged you out!");
   res.redirect("/");
});



//========================
//Error Catching Route
//========================

app.get("*",function(req,res) {
  res.redirect("/");
})


//=======================
//Middleware
//=======================

function isUserLoggedIn(req,res,next){
    if(req.isAuthenticated()&&req.user&&req.user.role=="user")
    {
        
        console.log(req.user.role);
        console.log("user");
        return next();
    }
    req.flash("error","Please login first");
    res.redirect("/login/user");
}

function isOrganiserLoggedIn(req,res,next){
    if(req.isAuthenticated()&&req.user&&req.user.role=="organiser")
    {
        console.log(req.user.role);
        console.log("organiser");
        return next();
    }
    req.flash("error","Please login first");
    res.redirect("/login/organiser");
}


app.listen(process.env.PORT,process.env.IP,function(){
    console.log("server started");
});

function captcha(req,res,next){
		 // g-recaptcha-response is the key that browser will generate upon form submit.
		 // if its blank or null means user has not selected the captcha, so return the error.
		 if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
		 // return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
			req.flash("error","Please select captcha");
	    	return res.redirect("/register/user");
		 	
		 }
		// Put your secret key here.
		var secretKey = "";
		// req.connection.remoteAddress will provide IP address of connected user.
		var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
		// Hitting GET request to the URL, Google will respond with success or error scenario.
		request(verificationUrl,function(error,response,body) {
			if(error){
				req.flash("error","Something went wrong");
				return res.redirect("/register/user");
			}
			body = JSON.parse(body);
	    	// Success will be true or false depending upon captcha validation.
	    	if(body.success !== undefined && !body.success) {
	    		req.flash("error","Invalid captcha");
	    		return res.redirect("/register/user");
			}
			next();
		});
}

//================================
//Email Verification 
//================================
