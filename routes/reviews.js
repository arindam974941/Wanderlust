const  express = require("express");
const router = express.Router({mergeParams: true});

const wrapAsync = require("../utils/wrapAsync.js");
 
const {validateReview, isLoggedIn, isReviewOwner} = require("../middlewares.js");

const reviewController = require("../controllers/reviews.js");

// REVIEWS
// post review route
router.post("/", 
    validateReview,
    isLoggedIn,
    wrapAsync(reviewController.createReview)
);

// delete review route
router.delete("/:reviewId",
    isLoggedIn,
    isReviewOwner,
     wrapAsync( reviewController.deleteReview)
);

module.exports = router;
