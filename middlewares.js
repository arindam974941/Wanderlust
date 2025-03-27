const Listing = require("./models/listing.js");
const Review = require("./models/review.js");


const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schemaValidationJoi.js");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl; // req.originalUrl is the URL that the user is trying to access before being redirected to the login page.
        req.flash("error", "You must be signed in first");
        return res.redirect("/login");
    }
    next();
};

//This middleware function checks if the user is logged in. If the user is not logged in, the middleware saves the URL that the user is trying to access in the session and redirects the user to the login page.
//The URL that the user is trying to access is saved in the session under the key returnTo. This key is used to store the URL that the user is trying to access before being redirected to the login page.
module.exports.saveReturnTo = async (req,res,next) => {
     if(req.session.returnTo){
       res.locals.returnTo = req.session.returnTo;
        }
    next();
};


module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currentUser._id)){  // This checks if the user is the owner of the listing. If the user is not the owner of the listing, the user is redirected to the listing page with an error message.
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/listings/${id}`);
     }
        next();
    };

    // This middleware function checks if the user is the owner of the review. If the user is not the owner of the review, the user is redirected to the listing page with an error message.
module.exports.isReviewOwner = async (req,res,next) => {
    let {id, reviewId} = req.params;    
    let review = await Review.findById(reviewId);
    try{
        
        if(!review.author.equals(res.locals.currentUser._id)){
            req.flash("error", "You do not have permission to do that");
            return res.redirect(`/listings/${id}`);
        }
    }
    catch(e){
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }
   
    next();
};

    // Joi schema validation for listing route  // This is a middleware function that validates the data sent to the server using the Joi schema.
module.exports.validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
        if(error){
            throw new ExpressError(400, error);
        }else{
            next();
        }
};

// a middleware for server side validation of review 
module.exports.validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
        if(error){
            throw new ExpressError(400, error);
        }else{
            next();
        }
};