var express= require('express');
var router= express.Router();
var multer = require('multer');
var Car = require('../models/Car');
var storage = multer.diskStorage({
destination:'http://webcar1.herokuapp.com//assets/uploads',
filename: function (req, file, cb) {
var fileSplit = file.originalname.split(".");
var filename = file.originalname; 
var fileLength = fileSplit.length;
var extension = fileSplit[fileLength-1];
filename = filename.replace("."+extension,"-");
cb( null, filename+ Date.now()+"."+extension);
}
})

var upload = multer({ storage: storage }).single('images')

router.post('/', function (req, res) {
console.log(req.file);
upload(req, res, function (err) {
if (err)
{
// An error occurred when uploading
console.log(err);
}

var newCar = new Car({
"user": req.body.userid,
"registration_no": req.body.registration_no,
"model": req.body.model,
"speedometer": req.body.speedometer,
"manufacturer": req.body.manufacturer,
"photos":req.file.filename,
"cost": req.body.cost,
});


var currentDate = new Date();
newCar.created_at = currentDate;
newCar.updated_at = currentDate;

newCar.save(function (err, car) {
try {
if (err) return res.send({ "status": "Error", "message": "Registration Number already Exists" });
return res.send({ "status": "Success", "message": "Data Inserted", "cars": car, "path" : req.file.path });
}
catch (err) {
res.send({ "status": "Error", "message": err });
throw err
}
});

// Everything went fine
})
});


module.exports = router;
