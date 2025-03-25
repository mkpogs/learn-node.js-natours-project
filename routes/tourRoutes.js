import express from 'express';
import {
    aliasTopTours,
    getAllTours, 
    createTour, 
    getTour, 
    updateTour, 
    deleteTour,
    getTourStats,
    getMonthlyPlan
} from './../controllers/tourController.js';
import { protect, restrictTo } from "./../controllers/authController.js";
import reviewRouter from './reviewRoutes.js';

const router = express.Router();

// Param Middleware
// router.param('id', checkID);

// ===== Mounting Routes =====
// --Nesting Routes
router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

router.route('/')
    .get(protect, getAllTours)
    .post(createTour);

router.route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(protect, 
        restrictTo('admin', 'lead-guide'), 
        deleteTour);

export default router;