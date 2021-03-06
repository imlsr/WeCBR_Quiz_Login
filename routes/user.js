var express                     =   require("express"),
    router                      =   express.Router(),
    User                        =   require("../models/user"),
    multer                      =   require("multer"),
    passport                    =   require('passport'),
    upload                      =   multer({dest: __dirname + '/uploads/images'});

//  Homepage
router.get("/", function(req, res){
    res.render('user/home');
});
  
  
//   Login Page 
router.get("/login", function(req, res){
    res.render("user/login");
});
  
//  Register Page
router.get("/register", function(req, res){
    res.render("user/register");
});   
  
//     
router.get("/dashboard", function(req, res){
    res.render("dashboard");
});
  
  
//  Logout API
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

// Forgot Password
router.get("/forgot" , function(req, res){
    res.render("forgot");
});


//Reset Password
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      alert('Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset');
  });
});
  
//  POST API - To register User 
router.post("/register", function(req, res){
    User.register({username: req.body.username, firstName:req.body.firstName, lastName:req.body.lastName}, req.body.password, function(err, user){
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/dashboard");
        });
      }
    });
  
});
  
//     POST Api - To Login User
router.post("/login", function(req, res){
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/dashboard");
        });
      }
    });
});


//POST Api - Forgot Password
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
        if (!user) {
          alert('No account with that email address exists.');
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
          user: '#################',
          pass: '#################'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'demo@demo.com',
        subject: '  WeCBR Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        alert('An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

//POST Api for reset password

app.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          alert('Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: 'USERNAME',
          pass: 'PASSWORD'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        alert('Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

module.exports = router;