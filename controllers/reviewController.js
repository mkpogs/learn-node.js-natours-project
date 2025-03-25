import Review from './../models/reviewModel.js';
import {
    createOne,
    getAll,
    getOne,
    updateOne,
    deleteOne
 } from './handlerFactory.js';


// ===== Route Handler =====
// Create New Review
export const setTourUserIds = (req, res, next) => {
    // Allow Nested Routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
 }
export const createReview = createOne(Review);

// Fetch All Reviews
export const getAllReviews = getAll(Review);

// Fetch Specific Review by ID
export const getReview = getOne(Review);

// Update Specific Review
export const updateReview = updateOne(Review);

// Delete Specific Review
export const deleteReview = deleteOne(Review);