import Tour from './../models/tourModel.js';
import catchAsync from './../utils/catchAsync.js';
import AppError from './../utils/appError.js';

export const getOverview = catchAsync(async(req, res, next) => {
    // 1. Get tour data from collection
    const tours = await Tour.find();
    // 2. BUild Template

    // 3. Render that template using data from 1



    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

export const getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker Tour'
    });
}