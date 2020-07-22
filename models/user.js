var mongoose                    =   require("mongoose"),
    passportLocalMongoose       =   require("passport-local-mongoose");

const user2Schema = new mongoose.Schema ({
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
  });
  
user2Schema.plugin(passportLocalMongoose);
  
module.exports = mongoose.model("User", user2Schema);