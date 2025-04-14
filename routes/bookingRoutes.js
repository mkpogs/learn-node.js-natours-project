import express from 'express';
import {
    getCheckoutSession
} from './../controllers/bookingController.js';
import { protect, restrictTo } from "./../controllers/authController.js";

const router = express.Router();

router.get(
    '/checkout-session/:tourId', 
    protect, 
    getCheckoutSession
);

export default router;