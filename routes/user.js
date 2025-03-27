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
    saveReturnTo,   // This is a middleware that saves the URL the user is trying to access before being redirected to the login page. 
    passport.authenticate('local', {
        failureFlash: true,
         failureRedirect: "/login"
        }), // This is the middleware that authenticates the user using the local strategy we defined. If the authentication fails, the user is redirected to the login page. 
     usersController.login 
    );

// get request for logout 
router.get("/logout", usersController.logout);

module.exports = router; // This exports the router object so that it can be used in other files.