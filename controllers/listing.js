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