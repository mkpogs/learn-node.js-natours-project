import mongoose from "mongoose";
import Tour from "./../models/tourModel.js";


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


// ===== MIDDLEWARE =====

// -- Populate Middleware
reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    });

    next();
});

// ===== Indexes =====
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });


// ===== Static Method =====
reviewSchema.statics.calcAverageRatings = async function(tourId){
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
        
    ]);
    console.log(stats);

    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

reviewSchema.post('save', function(){
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
});

// Store the document before updating/deleting
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.clone().findOne(); // Clone the query before executing
    // console.log(this.r);
    next();
});

// After update/delete, run calcAverageRatings
reviewSchema.post(/^findOneAnd/, async function() {
    if (this.r) { // Ensure `this.r` exists
        await this.r.constructor.calcAverageRatings(this.r.tour);
    }
});



const Review = mongoose.model('Review', reviewSchema);
export default Review;