const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review.js");


const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    image: {
        filename: {
            type: String
        },
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            set: function (v) {
                return (!v || v.trim() === "") ? "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60": v; 
            }
        }
    },
    price: {
        type: Number,
    },
    location: {
        type: String,
    },
    country: {
        type: String,
    },
    
    booked: { // New field to track booking status
        type: Boolean,
        default: false
    },
    bookedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    bookedAt: { // New field to store the booking timestamp
        type: Date,
        default: null
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

// middleware to delete reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (listing) {
    if(listing){
        await Review.deleteMany({
            _id: {
                $in: listing.reviews
            }
        })
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;