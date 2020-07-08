//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport")
const mongoose = require("mongoose");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret: "wecbr-quiz-login",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/UserDB", {useNewUrlParser : true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  firstName : String,
  lastName : String,
  username : String,
  password : String

});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());






//ROUTES-GET-START
app.get("/quiz/login" , function(req , res){
  res.sendFile(__dirname + '/login.html');
})

app.get("/quiz/register" , function(req , res){
  res.sendFile(__dirname + '/register.html');
})

app.get("/quiz/dashboard" , function(req, res){
  if(req.isAuthenticated()){
    //Open Dashboard
  }else {
    res.redirect("/quiz/login");
  }

});
//ROUTES-GET-END




//ROUTES-POST-START
app.post("/quiz/register" , function(req , res){

  User.register({username:req.body.email , firstName : req.body.firstName , lastName : req.body.lastName }, req.body.pass , function(err, user){
    if(err) {
      console.log(err);
      res.redirect("/quiz/register");
    }else{
      passport.authenticate("local")(req , res , function(){
        res.redirect("/quiz/dashboard")
      });
    }
  });

});

app.post("/quiz/login" , function(req , res){

  const user = new User({
    username: req.body.email,
    password: req.body.pass
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req , res , function(){
        res.redirect("/quiz/dashboard");
      });
    }
  });
});
//ROUTES-POST-END





var port = process.env.port || 3000;
app.listen(port);
