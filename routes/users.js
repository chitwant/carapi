var express = require('express');
var router = express.Router();
var bluebird = require('bluebird');
//var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

var SECRET = 'shhhhhhared-secret';

//var bcrypt = require('bcryptjs');
// if our User.js file is at models/User.js
var User = require('../models/User');
var U = require('../models/User');
//for error templates
var error = require("../error");
var config = require("../config");
//For email tempaltes
var smtp = require("../smtp");
var EmailTemplate = require('email-templates').EmailTemplate;
//getting email templates
var path = require('path');
var templatesDir = path.resolve(__dirname, '../templates');


//save/POST data in database
router.route('/signUp').post(function (req, res) {
  //Validations
  //req.assert('firstname', error.firstnameVald).matches(/^[a-z]+$/);
  req.assert('firstname', error.firstnameReq).notEmpty();
  //req.assert('lastname', error.lastnameVald).matches(/^[a-z]+$/);
  req.assert('lastname', error.lastnameReq).notEmpty();
  req.assert('email', error.emailReq).notEmpty();
 // req.assert('email', error.emailVald).isEmail();
  req.assert('password', error.passwordReq).notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.send({ "status": "Error", "message": errors });
  }
  var newUser = User({
    "firstname": req.body.firstname,
    "lastname": req.body.lastname,
    "email": req.body.email,
    "password": req.body.password,
    "isactive": "false",
    "isdeleted": "false",
  });
  // get the current date
  var currentDate = new Date();
  newUser.created_at = currentDate;
  newUser.updated_at = currentDate; 

  //Start check Email is registered or not
  User.find({ "email": req.body.email }, function (err, user) {
    newUser.save(function (err, user) {
      try {
        if (err) return res.send({ "status": "error", "message": err });
        if (!err) {        

        // Email code
     
               // "register" is template name
          var template = new EmailTemplate(path.join(templatesDir, 'register'));
          var locals = {
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            email: req.body.email,
          };
                    
          template.render(locals, function (err, results){
            if (err) {
                return console.error(err);
            }
            mailData = {
              from : 'testing@gmail.com',
              to : req.body.email,
              subject : results.subject,
              text : results.text,
              html : results.html
              }
          var smtpProtocol = smtp.smtpTransport;
        
          smtpProtocol.sendMail(mailData, function(error, info){
            if (err) return res.send({ "status": "error", "message": err });
            return res.send({ "status": "Success", "message": "User Registered Successfully!!", "users": user }); 
          }); 
        }
        
        //End email code
           )};
     }
      catch (err) {
        res.send({ "status": "Error", "message": err });
        throw err
      }
    });
  });
  //END check Email is registered or not
});
  
  //User Login
  router.post('/login', function (req, res) {
    console.log(req.body.email);
    User.findOne({isactive: true, email: req.body.email }, function (err, user) {
      
      if (err) return res.send({ auth: false, msg : "Error on the server."});
      if (!user) return res.send({ auth: false, msg : "Please verify the email."});
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (err) { 
           res.json({ msg: err,statusCode:400,user: null });
         } else{

          if(isMatch){
          var token = jwt.sign({email:req.body.email,password:req.body.password }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
          });
          user.token=token;
            return res.send({ auth: true, message : "User successfully Login.", user: user,token:token });
            }  
            return res.send({ msg: "Invalid username & Password",statusCode:200,user: null });       
          }
    
    });

  });
});
  //User LogOut
  router.get('/logout', function (req, res) {
    res.status(200).send({ auth: false, token: null });
  });

  //send car detail eamil on ask for price
  router.post('/sendcardetail', function (req, res) {
 console.log(req.body);
 try {

  var template = new EmailTemplate(path.join(templatesDir, 'carprice'));
  var locals = {
    customername: req.body.customername,
    customeremail: req.body.customeremail,
    customerid: req.body.customerid,
    registration_no: req.body.Registration_no,
    Manufacturer: req.body.Manufacturer,
    Model: req.body.Model,
    ownername: req.body.ownername,
    owneremail: req.body.owneremail,
    ownerid: req.body.ownerid
  };
       // Email code
     
  template.render(locals, function (err, results){
    if (err) {
        return console.error(err);
    }
    mailData = {
      from : 'testing@gmail.com',
      to : req.body.owneremail,
      subject : results.subject,
      Text : results.text,
      html : results.html
      }
    var smtpProtocol = smtp.smtpTransport;
   
      smtpProtocol.sendMail(mailData, function(error, info){
    if (error) {
      res.send({ "status": "Error", "message": error });
    } else {
         return res.send({ "status": "Success", "message": "Email Sent to admin" });
    }
  }); 
});
  }
 
  catch (err) {
    res.send({ "status": "Error", "message": err });
    throw err
  }
 
   
  });


 // send reject car status with user  

  router.post('/rejectcarrequest/', function (req, res) {
    console.log(req.body);
    try {
       // Email code
     
     // "register" is template name
     var template = new EmailTemplate(path.join(templatesDir, 'carreject'));
     var locals = {
       name: req.body.name,
       email: req.body.email,
     
     };
       
     template.render(locals, function (err, results){
       if (err) {
           return console.error(err);
       }
       mailData = {
        from : 'testing@gmail.com',
         to :  req.body.email,
         subject : results.subject,
         Text : results.text,
         html : results.html
         }
   var smtpProtocol = smtp.smtpTransport;

     smtpProtocol.sendMail(mailData, function(error, info){
       if (error) {
         res.send({ "status": "Error", "message": error });
       } else {
         return res.send({ "status": "Success", "message": "Email Send" });
       }
     }); 
   });
     }
    
     catch (err) {
       res.send({ "status": "Error", "message": err });
       throw err
     }
    
      
     });


// Count  all users
router.route('/userCount').get(function (req, res) {
  User.count({ isdeleted: "false" }, function (err, user) {
    try {
      if (err) return res.send({ "status": "Error", "message": err });
      return res.send({ "status": "Success", "message": "User list", "users": user });
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
});

// get all users
router.route('/getUsers').get(function (req, res) {
  User.find({ isdeleted: "false" }, function (err, user) {
    try {
      if (user == '') {
        return res.send({ "status": "Error", "message": 'Users list not avaliable.' });
      } else {
        return res.send({ "status": "Success", "message": "User list avaliable", "users": user });
      }
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
});

//update user
router.route('/updateUser/:email').put(function (req, res) {
  var myquery = { "email": req.body.email };
  var newvalues = {
    $set: {
      "firstname": req.body.firstname,
      "lastname": req.body.lastname,
      "password": req.body.password,
      "isactive": req.body.isactive,
      "isdeleted": req.body.isdeleted,
    }
  };
  User.update(myquery, newvalues, function (err, user) {
    try {

      if (err) return res.send({ "status": "Error", "message": err });
      return res.send({ "status": "Success", "message": "User list", "users": user });
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
});

// change password 
router.route('/changepassword/:email').post(function (req, res) {  
  User.findOne({ "email": req.params.email },function (err, user) {
    try {
      if (err) return res.send({ "status": "Error", "message": err });   
      if (!user) return res.status(404).send('No email found.');   
      user.comparePassword(req.body.oldpassword, (err, isMatch) => {
        if (err) { 
           res.json({ msg: err,statusCode:400,user: null });
         } else{

          if(isMatch){
            user.password = req.body.password;   
         user.save(function (err, user) {
         return res.send({ "status": "Success", "message": "Password is changed" });
         });
        }
      
      }
  });
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
});


// change user password after login
router.route('/changepassword/:email').put(function (req, res) {
  var myquery = { "email": req.body.email };
  var newvalues = {
    $set: {  "password": req.body.password } 
  };
  User.update(myquery, newvalues, function (err, user) {
    try {

      if (err) return res.send({ "status": "Error", "message": err });
      return res.send({ "status": "Success", "message": "Password is change.", "users": user });
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
});


//GetByID
router.get('/getByID/:id', function (req, res) {
  User.findById(req.params.id, function (err, user) {
    try {
      if (err) return res.send("There was a problem finding the user.");
      if (!user) return res.send("No user found.");
      res.send(user);
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });

});

//GetByEmail
router.route('/getByEmail/:email').get(function (req, res) {
  User.find({ "email": req.params.email }, function (err, user) {
    try {
      if (user.length)
        return res.send({ "status": "Success", "message": "User list", "users": user });
      return res.send({ "status": "Error", "message": "Email not Found" });
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
});

// REMOVE/Update all users
router.route('/delete/:email').put(function (req, res) {
  var newvalues = { $set: { isdeleted: 'true' } };
  User.update({ "email": req.params.email }, newvalues, function (err, user) {
    // User.update({fname:"Gurpreet"}, {$set: {lname:"SIDHU",email:"SIDHU@gmail.com"}},function (err, user) {
    try {
      if (err) return res.send({ "status": "Error", "message": err });
      return res.send({ "status": "Success", "message": "User list", "users": user });
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
});


// after register verfiy email isActive status update

router.route('/changeuserstatus/:email').put(function (req, res) {
  var newvalues = { $set: { isactive: 'true' } };
  User.update({ "email": req.params.email }, newvalues, function (err, user) {
    // User.update({fname:"Gurpreet"}, {$set: {lname:"SIDHU",email:"SIDHU@gmail.com"}},function (err, user) {
    try {
      if (err) return res.send({ "status": "Error", "message": err });
      return res.send({ "status": "Success", "message": "Email verified" });
    }
    catch (err) {
      res.send({ "status": "Error", "message": err });
      throw err
    }
  });
});

//for send email for accepting car request
router.route('/sendemail').post(function (req, res) {
  try {
  // "register" is template name
  var template = new EmailTemplate(path.join(templatesDir, 'carprice'));
  var locals = {
    firstName: 'Gurpreet',
    lastName: 'Sandhu',
  };
    
  template.render(locals, function (err, results){
    if (err) {
        return console.error(err);
    }
    mailData = {
      From : 'test@gmail.com',
      to : 'guri.preet@gmail.com',
      subject : results.subject,
      Text : results.text,
      html : results.html
      }
   var smtpProtocol = smtp.smtpTransport;
   smtpProtocol.sendMail(mailData, function(error, info){
    if (error) {
      res.send({ "status": "Error", "message": error });
    } else {
      return res.send({ "status": "Success", "message": "Email Send" });
    }
  }); 
});
  }
 
  catch (err) {
    res.send({ "status": "Error", "message": err });
    throw err
  }
 


});


module.exports = router;
