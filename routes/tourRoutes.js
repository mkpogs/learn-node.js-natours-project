import express from 'express';
import {
    aliasTopTours,
    getAllTours, 
    createTour, 
    getTour, 
    updateTour, 
    deleteTour
} from './../controllers/tourController.js';

const router = express.Router();

// Param Middleware
// router.param('id', checkID);

router.route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

router.route('/')
    .get(getAllTours)
    .post(createTour);

router.route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

export default router;