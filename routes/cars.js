var express = require('express');
var router = express.Router();

// if our user.js file is at models/user.js
var Car = require('../models/Car');

//CAR API's
//save/POST Car data in database
 router.route('/addcar').post(function (req, res) {

    var newCar = new Car({
       "user": req.body.userid,
        "registration_no": req.body.registration_no,
       "model": req.body.model,
        "speedometer": req.body.speedometer,
       "manufacturer": req.body.manufacturer,
       "cost": req.body.cost,
       "PhotoPath": req.body.photopath,
        "status": "yes"       
    });

    // get the current date
    var currentDate = new Date();
    newCar.created_at = currentDate;
    newCar.updated_at = currentDate;

   newCar.save(function (err, car) {
      try{
        console.log(req.body.registration_no);
        if (err) return res.send({ "status": "Error", "message": err });
      return res.send({ "status": "Success", "message": "Car Instered", "cars": car });
     }
      catch (err) {
        res.send({ "status": "Error", "message": err });
        throw err
      }
    });

    //END check Email is registered or not
 });



// get all CAR's
router.route('/carlist').get(function (req, res) {
      Car.find({ isdeleted: "false" }).populate('User','firstname'). // only return the Persons name
    exec (function (err, car) {
             
        try {
            if (car == '') {
                return res.send({ "status": "Error", "message": 'Car list not avaliable.' });
            } else {
                return res.send({ "status": "Success", "message": "Car list avaliable", "cars": car });
               
            }
        }
        catch (err) {
            res.send({ "status": "Error", "message": err });
            throw err
        }

    });
});


//Car list GetByID
router.get('/carlistbyUserId/:userid', function (req, res) {
  //  var newvalues = { $set: { isdeleted: 'false' } };
    Car.find({ "user": req.params.userid , "isdeleted": false }).populate('User','user'). // only return the Persons name
    exec (function (err, car) {
   try{
  
        if (err) return res.send("There was a problem finding the car.");
        if (!car) return res.send("No user found.");
        return res.send({ "status": "Success!", "message": "Get Car by id", "cars": car });
   }
   catch (err) {
    res.send({ "status": "Error", "message": err });
    throw err
  }
    });

});




//Get by ID
router.get('/getID/:id', function (req, res) {
    Car.findById(req.params.id, function (err, car) {
      if (err) return res.send("There was a problem finding the car.");
      if (!car) return res.send("No car found.");
      return res.send({ "status": "Success", "message": "Get Car by id", "cars": car });
    })
    .populate('user',['firstname','lastname']);
  
  });


// REMOVE/Update car's
router.route('/deletecar/:registration_no').put(function (req, res) {
    var newvalues = { $set: { isdeleted: 'true' } };
    Car.update({ "registration_no": req.params.registration_no }, newvalues, function (err, car) {
        // User.update({fname:"Gurpreet"}, {$set: {lname:"SIDHU",email:"SIDHU@gmail.com"}},function (err, user) {
       try{
        if (err) return res.send({ "status": "Error", "message": err });
        return res.send({ "status": "Success", "message": "Car list", "cars": car });
       }
       catch (err) {
        res.send({ "status": "Error", "message": err });
        throw err
      }
    });
});

// Update car's status
router.route('/updateCarStatus/:registration_no').put(function (req, res) {
  Car.findOne({ "registration_no": req.params.registration_no},
   function (err, car) {

    if (err) return res.send("There was a problem finding the car.");
      if (!car) return res.send("No found.");
    
      if(car.status=='accepted'){
        return res.send({ "status": "Success", "message": "A link expired" });
      }
      var newvalues = { $set: { status: 'accepted' } };
    Car.update({ "registration_no": req.params.registration_no, "isdeleted": "false" }, newvalues, function (err, car) {
      try{
        if (err) return res.send({ "status": "Error", "message": err });
        return res.send({ "status": "Success", "message": "Car Status Updated", "cars": car });
      }  
      catch (err) {
        res.send({ "status": "Error", "message": err });
        throw err
      }  
      
    });
 
});

});
// get car status is accepted or not 
router.route('/carStatus/:registration_no').get(function (req, res) {
  console.log(req.params.registration_no);
 // var newvalues = { $set: { isdeleted: 'true' } };
  Car.find({ "registration_no": req.params.registration_no, "status" : 'accepted' }, function (err, car) {
     
      if (err) return res.send({ "status": "Error", "message": err });
      return res.send({ "status": "Success", "message": "Car list", "cars": car });
    
  });
});

module.exports = router;
