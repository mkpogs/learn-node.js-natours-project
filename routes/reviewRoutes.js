import express from 'express';
import {
    createReview,
    getAllReviews,
    getReview,
} from './../controllers/reviewController.js';
import { protect, restrictTo } from "./../controllers/authController.js";

const router = express.Router();


router.route('/')
    .get(getAllReviews)
    .post(protect, restrictTo('user'),createReview);

router.route('/:id')
    .get(getReview)
    // .patch()
    // .delete()


export default router;