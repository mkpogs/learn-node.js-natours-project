import express from "express";
import tourRouter from './tourRoutes.js';
import userRouter from './userRoutes.js';
import reviewRouter from './reviewRoutes.js';
import bookingRouter from './bookingRoutes.js';
import viewRouter from './viewRoutes.js';

const router = express.Router();

// Mounting Routes
router.use('/', viewRouter);
router.use('/api/v1/tours', tourRouter);
router.use('/api/v1/users', userRouter);
router.use('/api/v1/bookings', bookingRouter);
router.use('/api/v1/reviews', reviewRouter);


export default router;