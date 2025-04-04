const  express = require("express");
const router = express.Router({mergeParams: true});
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require('passport');
const { saveReturnTo } = require("../middlewares.js");

const usersController = require("../controllers/users.js");
const user = require("../models/user.js");

// get request for rendering signup page
router.get( "/signup", usersController.renderSignup); 

// post request for signup
router.post("/signup",wrapAsync ( usersController.signup));

// get request for rendering login page
router.get("/login", usersController.renderLogin);

// post request for login
router.post("/login",
    saveReturnTo,   
    passport.authenticate('local', {
        failureFlash: true,
         failureRedirect: "/login"
        }), 
     usersController.login 
    );

// Route to initiate Google signup/login
router.get('/auth/google/signup',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
router.get('/auth/google/login',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get('/auth/google/callback',
  saveReturnTo,  
  passport.authenticate('google', {
    failureFlash: true,
    failureRedirect: '/login'
  }),
  usersController.login // Controller to handle user login after successful authentication
);


// get request for logout 
router.get("/logout", usersController.logout);

module.exports = router;