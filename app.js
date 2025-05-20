




if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const  express = require("express");
const app = express();

// const helmet = require("helmet");

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: [
//         "'self'",
//         "https://cdn.jsdelivr.net",
//         "https://cdnjs.cloudflare.com"
//       ],
//       styleSrc: [
//         "'self'",
//         "'unsafe-inline'",
//         "https://cdn.jsdelivr.net",
//         "https://cdnjs.cloudflare.com",
//         "https://fonts.googleapis.com"
//       ],
//       fontSrc: [
//         "'self'",
//         "https://fonts.gstatic.com",
//         "https://cdnjs.cloudflare.com"
//       ],
//       imgSrc: [
//         "'self'",
//         "data:",
//         "https://res.cloudinary.com"
//       ],
//       connectSrc: ["'self'"],
//       objectSrc: ["'none'"],
//       upgradeInsecureRequests: [],
//     },
//   })
// );

// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https://res.cloudinary.com; object-src 'none';"
//   );
//   next();
// });


const port = 8080;
const path = require("path");

const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate');

const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const dbUrl = process.env.ATLASDB_URL;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", 
    "default-src 'self'; font-src 'self' https://wanderlust-om9s.onrender.com; style-src 'self' 'unsafe-inline'; script-src 'self';"
  );
  next();
});



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
// use ejs-locals for all ejs templates:
app.engine('ejs', engine);


app.use((req, res, next) => {
    res.locals.currentPath = req.path; // This sets the current path for use in EJS templates
    next();
});

main()
.then(() => {
    console.log("connection extablished");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

//The connect-flash middleware in Express is used to store messages in the session and display them to the user.
const session = require('express-session');
const MongoStore = require('connect-mongo');

const mongoStore = MongoStore.create({
     mongoUrl: dbUrl,
     crypto: {
        secret: process.env.SECRET,
     },
     touchAfter: 24 * 3600,

    });

    mongoStore.on("error", () => {
        console.log("ERROR IN MONGO session store", err);
    });

const sessionOptions = { 
    store: mongoStore,
     secret: process.env.SECRET, // This sets the secret key used to sign the session ID cookie
    resave: false, // This specifies whether the session should be saved even if it hasn't been modified
    saveUninitialized: true, // This specifies whether a new but unmodified session should be saved
    Cookie : {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week  // This sets the expiration date of the cookie
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week // This sets the maximum age of the cookie
    }
  };
app.use(session(sessionOptions));

//The express-session middleware must be used before the connect-flash middleware in order for flash messages to work correctly.
flash = require('connect-flash');
app.use(flash());

app.use(passport.initialize()); // This initializes the passport middleware and is required to use passport in an Express application.
app.use(passport.session()); // This tells passport to use the express-session middleware.
passport.use(new LocalStrategy(User.authenticate())); // This tells passport to use the local strategy we defined for authenticating users.
passport.serializeUser(User.serializeUser()); // This tells passport how to serialize a user (i.e., how to store a user in the session). 
passport.deserializeUser(User.deserializeUser()); // This tells passport how to deserialize a user (i.e., how to retrieve a user from the session).

app.use( (req,res,next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.currentUser = req.user ;
      next();
  });

 
 passport.use(new GoogleStrategy({
     clientID: process.env.GOOGLE_CLIENT_ID,
     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
     callbackURL: "https://wanderlust-om9s.onrender.com/auth/google/callback"
   },
   async (accessToken, refreshToken, profile, done) => {
     try {
       let user = await User.findOne({ googleId: profile.id });
       if (!user) {
         user = new User({
           googleId: profile.id,
           username: profile.displayName,
           email: profile.emails[0].value
         });
         await user.save();
       }
       return done(null, user);
     } catch (err) {
       return done(err, null);
     }
   }
 ));

app.use("/listings", listingRouter); // This tells Express to use the listingRouter for any routes that start with /listings.
app.use("/listings/:id/reviews", reviewRouter);// This tells Express to use the reviewRouter for any routes that start with /listings/:id/reviews.
app.use("/", userRouter);




// server side validation( error handaling)
// if any client request any wrong path in our domain then throw this error
app.all("*", (req,res,next) =>{
 next(new ExpressError(404, "page is not found"));
});

app.use((err, req, res, next) => {
    let {statusCode =500, message = "some error has occured"} = err;
    res.status(statusCode).render("./listings/error.ejs", {message});
});

app.get("/", (req, res)=> {
    res.send("all ok");
});

app.listen(port, ()=> {
    console.log("app is listening on port on 8080");
});