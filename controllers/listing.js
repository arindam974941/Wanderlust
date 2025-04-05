const Listing = require("../models/listing.js");


module.exports.index = async (req, res)=> {
    let allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
    // console.log(allListings);
};

module.exports.renderNewForm = (req,res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
        path: "reviews",
        populate:{
        path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "listing you requested for does not exist");
        return res.redirect("/listings");
    }
    // console.log(listing);
    res.render("./listings/show.ejs",{listing});
};

module.exports.createNewListing = async (req,res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // This sets the owner of the listing to the current user.
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "Successfully created a new listing");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", {listing});
};

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    
   let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
   if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
   }
    req.flash("success", "Successfully updated a listing");
    res.redirect("/listings");
};

module.exports.deleteListing = async (req,res) => {
    let {id} = req.params;
     await Listing.findByIdAndDelete(id);
        req.flash("success", "Successfully deleted a listing");
    res.redirect("/listings");
};

module.exports.searchListings = async (req, res) => {
    const { search } = req.body;
    
    try {
        const listings = await Listing.find({ location: search });
        res.render('./listings/searchRes.ejs', { listings });
    } catch (err) {
        req.flash('error', 'Something went wrong with the search');
        res.redirect('/listings');
    }
};

const transporter = require("../utils/nodemailer.js");

module.exports.bookListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    listing.booked = true;
    listing.bookedBy = req.user._id;
    listing.bookedAt = new Date(); // Set the booking timestamp
    await listing.save();

    // Send an email to the listing owner
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: listing.owner.email,
        subject: `Your listing "${listing.title}" has been booked!`,
        html: `
            <h1>Hello ${listing.owner.username},</h1>
            <p>Your hotel "<strong>${listing.title}</strong>" has been booked by <strong>${req.user.username}</strong>.</p>
            <h3>User Details:</h3>
            <ul>
                <li><strong>Name:</strong> ${req.user.username}</li>
                <li><strong>Email:</strong> ${req.user.email}</li>
            </ul>
            <p>Thank you for using Wanderlust!</p>
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Error sending email:", err);
        } else {
            console.log("Email sent:", info.response);
        }
    });

    req.flash("success", "Hotel successfully booked!");
    res.redirect(`/listings`);
};

//Create a method to handle booking cancellations within 24 hours.
module.exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // Check if the user is allowed to cancel the booking
    const now = new Date();
    const bookingTime = new Date(listing.bookedAt);
    const timeDifference = (now - bookingTime) / (1000 * 60 * 60); // Time difference in hours

    if (timeDifference > 24) {
        req.flash("error", "You cannot cancel the booking after 24 hours.");
        return res.redirect(`/listings/${id}`);
    }

    // Cancel the booking
    listing.booked = false;
    listing.bookedBy = null;
    listing.bookedAt = null;
    await listing.save();

    // Send an email to the listing owner
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: listing.owner.email,
        subject: `Booking for "${listing.title}" has been canceled!`,
        html: `
            <h1>Hello ${listing.owner.username},</h1>
            <p>The booking for your hotel "<strong>${listing.title}</strong>" has been canceled by <strong>${req.user.username}</strong>.</p>
            <h3>User Details:</h3>
            <ul>
                <li><strong>Name:</strong> ${req.user.username}</li>
                <li><strong>Email:</strong> ${req.user.email}</li>
            </ul>
            <p>Thank you for using Wanderlust!</p>
        `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Error sending email:", err);
        } else {
            console.log("Cancellation email sent:", info.response);
        }
    });

    req.flash("success", "Booking successfully canceled!");
    res.redirect(`/listings/${id}`);
};