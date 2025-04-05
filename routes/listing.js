const  express = require("express");
const router = express.Router({mergeParams: true});

const wrapAsync = require("../utils/wrapAsync.js");
 
const {isLoggedIn, isOwner, validateListing} = require("../middlewares.js");

const listingController = require("../controllers/listing.js");

const multer  = require('multer'); // Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

// Index route
router.route("/")
    .get(wrapAsync(listingController.index)) // Index route for all listings // This route is used to display all the listings. The listings are retrieved from the database and displayed on the page.
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
         wrapAsync( listingController.createNewListing)
    ); // Create route for a new listing // This route is used to create a new listing. The listing is created using the data sent in the request body.

// new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing)) // Show route for a specific listing // This route is used to display a specific listing. The listing is retrieved from the database using the id provided in the URL.
    .put(isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.updateListing))// Update route for a specific listing // This route is used to update a specific listing. The listing is retrieved from the database using the id provided in the URL.
    .delete(isLoggedIn,
            isOwner,
            wrapAsync(listingController.deleteListing)); // Delete route for a specific listing // This route is used to delete a specific listing. The listing is retrieved from the database using the id provided in the URL.
            
// edit route
router.get("/:id/edit", 
    isLoggedIn,
    isOwner,
     wrapAsync( listingController.renderEditForm)
);

// search route
router.post('/search', 
    listingController.searchListings
);

// booking route
router.post("/:id/book", isLoggedIn, wrapAsync(listingController.bookListing));   // This route is used to book a listing. The listing is retrieved from the database using the id provided in the URL.

// cancel booking route
router.post("/:id/cancel", isLoggedIn, wrapAsync(listingController.cancelBooking));

module.exports = router;