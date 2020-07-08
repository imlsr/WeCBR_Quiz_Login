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

app.get("/quiz/login" , function(req , res){
  res.sendFile(__dirname + '/login.html');
})

app.get("/quiz/register" , function(req , res){
  res.sendFile(__dirname + '/register.html');
})


mongoose.connect("mongodb://localhost:27017/UserDB", {useNewUrlParser : true});

const userSchema = {
  firstName : String,
  lastName : String,
  email : String,
  password : String

};

const User = new mongoose.model("User", userSchema);

app.post("/quiz/register" , function(req , res){
  const newUser = new User({
    firstName : req.body.firstName,
    lastName : req.body.lastName,
    email : req.body.email,
    password : req.body.pass
  });

  newUser.save(function(err){
    if(err){
      console.log(err);
    } else {
      res.sendFile(__dirname + '/login.html');
    }
  })
})

app.post("/quiz/login" , function(req , res){


})






var port = process.env.port || 3000;
app.listen(port);
