var express         = require("express"),
    methodOverride  = require("method-override"),
    mongoose        = require("mongoose"),
    bodyparser      = require("body-parser"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    User            = require("./models/Users"),
    User_details    = require("./models/User_details"),
    //KYC_Type        = require("./models/KYC_Type"),
    app             = express();


var dbName;    

mongoose.connect("mongodb://localhost:27017/KJ_v1", { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret:"Gangadhar hi Shaktiman hai",
    resave:false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.get("/",  function(req, res){
    res.redirect("/user");
});

app.get("/landing", function(req, res) {
    res.send("This is the landing page");
});

app.get("/user", function(req, res) {
    User.find({}, function(err, userHere){
        if(err){
            console.log("OOPS there is an error");
        }
        else{
            res.render("index", {user_in_index: userHere});
        }
    });
});


app.get("/user/:id", function(req, res) {
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            res.redirect("/user");
            console.log(err)
          }
        else{
            res.render("show", {user_in_show: foundUser, panID:panID, panName:panName, panDOB:panDOB, liscName:liscName, liscDOB:liscDOB, liscAdd:liscAdd, liscID:liscID});
        }
    });
});

//================
// AUTH ROUTES
//================

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/");
            });
        }
    });
});


app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/user",
        failureRedirect: "/login"
        
    }), function(req, res) {
    
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});


//===================
//  MIDDLEWARE
//===================
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }   
    
    res.redirect("/login");
}


//================
// KYC TYPE
//================
app.get("/user/:id/details/kyc/new", function(req, res) {
    User.findById(req.params.id, function(err, KYC_for_details){
       if(err){
           console.log(err);
       } 
       else{
           res.render("kyc_type", {User_in_kyc:KYC_for_details});
       }
    });
});

app.post("/user/:id/details/kyc", function(req, res){
    User.findById(req.params.id, function(err, foundUser_for_Kyc){
        if(err){
            console.log(err);
        }
        else{
            User_details.KYC_Type.create(req.body.user_details_kyc, function(err, foundUser_here_details_kyc){
                if(err){
                    console.log(err);
                    res.render("/user");
                }
                else{
                    foundUser_for_Kyc.user_details.push(foundUser_here_details_kyc);
                    foundUser_for_Kyc.save();
                    res.redirect("/user/"+foundUser_for_Kyc._id);
                }
            });
        }
    });
});

//======================
// USER DETAILS VIA KYC
//======================


app.get("/user/:id/kyc_details", isLoggedIn, function(req, res){
  User.findById(req.params.id, function(req, res, User_to_add){
    User_to_add.user_details.update({
      name: nameMain[0]
    });
  });
});

// app.get("/user/kyc_details", isLoggedIn, function(req, res){
//   res.redirect("/user");
//   User.user_details.update({
//     name: dbName
//   });
// });

// app.get("/user/:id/kyc_details", isLoggedIn, function(req, res){
//   User.findById(req.params.id, function(err, User_to_add_details){
//     if(err){
//       console.log(err);
//     }
//     else{
//       // res.send("After inserting");
//       // User_to_add_details.user_details.create({
//       //   name: dbName
//         let newvalue = new User_details({
//           "name":dbName
//         });
//         newvalue.save();

      
//       res.redirect("/user");
//     }
//   });
// });

//==================
// USER DETAILS
//==================

app.get("/user/:id/details/new", function(req, res) {
    User.findById(req.params.id, function(err, User_for_details){
        if(err){
            console.log(err);
        }
        else{
            res.render("details", {foundUser_in_details: User_for_details});
        }
    });
    
});

app.post("/user/:id/details", function(req, res){
    User.findById(req.params.id, function(err, foundUser_for_details){
        if(err){
            res.redirect("/user");
            console.log(err)
        }
        else{
            User_details.create(req.body.user_details, function(err, foundUser_here_details){
                if(err){
                    console.log(err);
                    res.render("/user");
                }
                else{
                    foundUser_for_details.user_details.push(foundUser_here_details);
                    foundUser_for_details.save();
                    res.redirect("/user/"+foundUser_for_details._id);
                }
            });
            
        }
    });
});


app.listen(3000, () => console.log('Server listening on port 3000!'));

// app.listen(process.env.PORT, process.env.IP, function(){
//     console.log("Server running");
// });

/**
JAI's CODE
const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require("body-parser");
const path = require("path");


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use(express.static(__dirname + '/public'));


*/

//OCR
//PAN NAME 
//var name=detections[0]['description'];
//  var nameSplit = name.split("Name\n");
//    var nameMain = nameSplit[1].split("\n");
//    console.log(nameMain[0]);
    //detections.forEach(text => console.log(text));
    //console.log(nameSplit);


    //PAN DOB
//    var name=detections[0]['description'];
//    var nameSplit = name.split("Name\n");
//    var nameMain = nameSplit[2].split("\n");
//    console.log(nameMain[2]);

    //PAN CARD NO
//    var name=detections[0]['description'];
//    var nameSplit = name.split("Name\n");
//    var nameMain = nameSplit[0].split("\n");
//    console.log(nameMain[3]);


//client
  //.textDetection('jai_lisc.jpg')
  //.then(results => {
  //  const detections = results[0].textAnnotations;
  //  console.log('Text:');

    //LISC NAME
  //  var name = detections[0]['description'];
  //  var nameSplit = name.split("Name");
  //  var nameMain = nameSplit[1].split("S/D");
  //  console.log(nameMain[0]);

    //console.log(nameSplit);

    //LISC DLNO
  //  var name = detections[0]['description'];
  //  var nameSplit = name.split("Name");
  //  var nameMain = nameSplit[0].split("DL No");
  //  var DLNO = nameMain[1].split("\n");
  //  console.log(DLNO[0]);

    //LISC ADDRESS
  //  var name = detections[0]['description'];
  //  var nameSplit = name.split("Name");
  //  var nameMain = nameSplit[1].split("Add");
  //  var ADDRESS = nameMain[1].split("PIN");
  //  console.log(ADDRESS[0]);

    //LISC DOB
  //  var name = detections[0]['description'];
  //  var nameSplit = name.split("Name");
  //  var nameMain = nameSplit[0].split("DOB");
  //  var DOB = nameMain[1].split("BG");
  //  console.log(DOB[0]);

  //})

  var liscName;
  var liscDOB;
  var liscAdd;
  var liscID;

  var panName;
  var panDOB;
  var panID;


  var cardTypeArray = ["PAN", "LISC"];
  var cardType;

  const vision = require('@google-cloud/vision');

  const client = new vision.ImageAnnotatorClient({
    keyFilename: 'NodeOCR-b37295e213e1.json',
    projectId: 'nodeocr'
  });


  function getText(cardType) {

    client
    .textDetection('agu_pan.jpg')
    .then(results => {

    const detections = results[0].textAnnotations;
    console.log('Text:');

    if (cardType == "PAN") {

      var panName, panDOB, panID = getPanDetails(detections);

      return panName, panDOB, panID;

    }

    else if (cardType == "LISC") {
      var liscName, liscDOB, liscID, liscAdd = getLiscDetails(detections);
      return liscName, liscDOB, liscID, liscAdd;

    }

   });

  }

  function getPanDetails(detections) {
    
    //PAN NAME 
    var name=detections[0]['description'];
    var nameSplit = name.split("Name\n");
    var nameMain = nameSplit[1].split("\n");
    console.log(nameMain[0]);

    panName = nameMain[0];

    //PAN DOB
    var name=detections[0]['description'];
    var nameSplit = name.split("Name\n");
    var nameMain = nameSplit[2].split("\n");
    console.log(nameMain[2]);

    panDOB = nameMain[2];

    //PAN CARD NO
    var name=detections[0]['description'];
    var nameSplit = name.split("Name\n");
    var nameMain = nameSplit[0].split("\n");
    console.log(nameMain[3]);

    panID = nameMain[3];

    return panName, panDOB, liscID;

  }

  function getLiscDetails(detections) {

    //LISC NAME
    var name = detections[0]['description'];
    var nameSplit = name.split("Name");
    var nameMain = nameSplit[1].split("S/D");
    console.log(nameMain[0]);

    liscName = nameMain[0];

    //LISC DLNO
    var name = detections[0]['description'];
    var nameSplit = name.split("Name");
    var nameMain = nameSplit[0].split("DL No");
    var DLNO = nameMain[1].split("\n");
    console.log(DLNO[0]);

    liscDOB = DLNO[0];

    //LISC ADDRESS
    var name = detections[0]['description'];
    var nameSplit = name.split("Name");
    var nameMain = nameSplit[1].split("Add");
    var ADDRESS = nameMain[1].split("PIN");
    console.log(ADDRESS[0]);

    liscAdd = ADDRESS[0];

    //LISC DOB
    var name = detections[0]['description'];
    var nameSplit = name.split("Name");
    var nameMain = nameSplit[0].split("DOB");
    var DOB = nameMain[1].split("BG");
    console.log(DOB[0]);

    liscDOB = DOB[0];

    return liscName, liscDOB, liscID, liscAdd;

  }

  app.get("/test_PAN", function(req, res) {
    getText(cardTypeArray[0]);
    res.render("picture");
  });

  app.get("/test_LISC", function(req, res){
    getText(cardTypeArray[1]);
    res.render("picture");
  });

/**
  client
  .textDetection('jai_lisc.jpg')
  .then(results => {
    const detections = results[0].textAnnotations;
    console.log('Text:');

    //LISC NAME
    var name = detections[0]['description'];
    var nameSplit = name.split("Name");
    var nameMain = nameSplit[1].split("S/D");
    console.log(nameMain[0]);

    //console.log(nameSplit);

    //LISC DLNO
    var name = detections[0]['description'];
    var nameSplit = name.split("Name");
    var nameMain = nameSplit[0].split("DL No");
    var DLNO = nameMain[1].split("\n");
    console.log(DLNO[0]);

    //LISC ADDRESS
    var name = detections[0]['description'];
    var nameSplit = name.split("Name");
    var nameMain = nameSplit[1].split("Add");
    var ADDRESS = nameMain[1].split("PIN");
    console.log(ADDRESS[0]);

    //LISC DOB
    var name = detections[0]['description'];
    var nameSplit = name.split("Name");
    var nameMain = nameSplit[0].split("DOB");
    var DOB = nameMain[1].split("BG");
    console.log(DOB[0]);

  })
  .catch(err => {
    console.error('ERROR:', err);
  });

*/

/**
app.get("/house",  isLoggedIn,  function(req, res) {
  res.render("home");
});
*/
/**
var image = 'taylor17.jpg';


app.post("/upload", isLoggedIn, function(req, res) {

client
  .textDetection('jai_lisc.jpg')
  .then(results => {
    const detections = results[0].textAnnotations;
    console.log('Text:');
    //console.log(detections[0]['description']);
    //detections.forEach(text => console.log(text));
/**

  //PAN
    var name = detections[0]['description'];
    var nameSplit = name.split("Name\n");
    var nameMain = nameSplit[1].split("\n");
    console.log(nameMain[0]);
*/
 /** 
//License
  var name = detections[0]['description'];
    var nameSplit = name.split("Name");
    var nameMain = nameSplit[1].split("S/DW");
    dbName = nameMain[0];
    console.log(nameMain[0]);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });

  res.render("home");
});

app.listen(3000, () => console.log('Server listening on port 3000!'));
*/

const fr = require('face-recognition');
const recognizer = fr.FaceRecognizer();
const nodeWebcam = require('node-webcam');

var image = fr.loadImage('adit_aad.jpg');
var userName = "userName";

function processUpload(image) {

  var setImage = fr.loadImage(image);
  const detector = fr.FaceDetector();
  var faceImages = detector.detectFaces(setImage, 150);
  faceImages.forEach((img, i) => fr.saveImage(`face_${i}.png`, img));

}

var image2 = fr.loadImage('adit_lisc.jpg');
var faces = [image2];
const path = require('path');
const fs = require('fs');

function train(image, userName) {

  // var fileName = 'model.json';
  // var filePath = path.resolve(__dirname); 
  // filePath = path.join(filePath, fileName);
  // if (fs.existsSync(filePath)) {
  //   console.log("exists");
  //   const modelState = require('model.json');
  //   recognizer.load(modelState);
  // }
  
  recognizer.addFaces(faces, userName);

  const modelState = recognizer.serialize();
  fs.writeFileSync('model.json', JSON.stringify(modelState));

}

function recognize (image) {
  console.log(recognizer.predict(image));
}

app.get("/image", function(req, res){

//processUpload('dad_pan.jpeg');
train(faces, "Me");
recognize(image);
})

app.get("/hello", function(req, res) {
  captureImage();
})

function captureImage() {

  const win = new fr.ImageWindow();
  
  var opts = {
    width: 1280,
    height: 720,
    quality: 100,
    delay: 0,
    saveShots: true,
    output: "jpeg",
    device: false,
    callbackReturn: "location",
    verbose: false     
  };

  var Webcam = nodeWebcam.create( opts ); 

  var imageName = "capturedImage";
  var i = 0;

  Webcam.capture( imageName, function( err, data ) {} );
  
  return imageName;

}
