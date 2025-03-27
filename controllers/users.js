const User = require("../models/user.js");

module.exports.renderSignup = (req,res) => {
    res.render("./users/signup.ejs");
};

module.exports.signup = async (req,res) => {
        try{
            const {email, username, password} = req.body;
            const newUser = new User({email, username});
            const registeredUser = await User.register(newUser, password);
            // once an user is registerd we want to login the user automatically
            req.login(registeredUser, (err) => {
                if(err){
                    return next(err);
                }
                req.flash("success", "Welcome to Wanderlust");
                res.redirect("/listings");
            });
        }catch(e){
            req.flash("error", e.message);
            res.redirect("/signup");
        }
};

module.exports.renderLogin = (req,res) => {
    res.render("./users/login.ejs");
};

module.exports.login = (req,res) => {
    req.flash("success", "Welcome back to Wanderlust");
    res.redirect(res.locals.returnTo || "/listings");
};

module.exports.logout = (req,res) => {
    req.logout( (err) => {
        if(err){
            return next(err); 
        }
        req.flash("success", "Goodbye");
         res.redirect("/listings");
    }); // This is a method provided by passport that removes the user's ID from the session. 
}