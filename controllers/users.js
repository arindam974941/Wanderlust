const User = require("../models/user.js");

module.exports.renderSignup = (req,res) => {
    res.render("./users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password); // Automatically hashes the password
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.googleSignup = async (req, res) => {
    try {
        const { profile } = req.authInfo; // Extract profile from Google OAuth
        const { id, emails, displayName } = profile;

        // Check if the user already exists
        const existingUser = await User.findOne({ googleId: id });
        if (existingUser) {
            req.flash('error', 'User already exists. Please log in.');
            return res.redirect('/login');
        }

        // Create a new user
        const newUser = new User({
            email: emails[0].value,
            username: displayName,
            googleId: id
        });
        await newUser.save();

        // Log in the user
        req.login(newUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Wanderlust!');
            res.redirect('/listings');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
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