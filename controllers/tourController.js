//# import fs from 'fs';
//# import { fileURLToPath } from 'url';
//# import { dirname } from 'path';
import Tour from './../models/tourModel.js';
import APIFeatures from './../utils/apiFeatures.js';
import catchAsync from './../utils/catchAsync.js';
import AppError from './../utils/appError.js';
import {
    createOne,
    updateOne, 
    deleteOne 
} from './handlerFactory.js';


// Create __dirname equivalent in ES module
//# const __filename = fileURLToPath(import.meta.url);
//# const __dirname = dirname(__filename);


// --- Tour Route Handlers
// Aliasing Routes
export const aliasTopTours = async(req, res, next) => {
    req.query.limit = '5';
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name,price,difficulty,ratingsAverage,summary";
    next();
}


// Create a new tour
export const createTour = createOne(Tour);

// Fetch all tours
export const getAllTours = catchAsync(async(req, res, next) => {

    // 2. Execute Query
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;

    // 3. Send Response
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
    
});

// Fetch Specific tour by ID
export const getTour = catchAsync(async(req, res, next) => {


    const tour = await Tour.findById(req.params.id).populate('reviews');
                        // Tour.findOne({_id:req.params.id});
                        // Tour.findById(req.params.id);
                    

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404)); // Handle error with 'next'
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});

// PUT - Update all elements of a tour by ID
// PATCH - Update 1 or more elements of a tour by ID
export const updateTour = updateOne(Tour);
// DELETE - Delete a tour by ID
export const deleteTour = deleteOne(Tour);


export const getTourStats = catchAsync(async(req, res, next) => {
    
    const stats = await Tour.aggregate([
        {
            $match: {
                ratingsAverage:{
                    $gte: 4.5
                }
            }
        },
        {
            $group:{
                // _id: '$difficulty',
                // _id: '$ratingsAverage',
                 _id: {
                    $toUpper: '$difficulty'
                 },
                numTours: {
                    $sum: 1
                },
                numRatings: {
                    $sum: '$ratingsQuantity'
                },
                avgRating: {
                    $avg: '$ratingsAverage'
                },
                avgPrice: {
                    $avg: '$price'
                },
                minPrice: {
                    $min: '$price'
                },
                maxPrice: {
                    $max: '$price'
                }
            }
        },
        {
            $sort:{
                avgPrice: 1
            }
        },
        // {
        //     $match: {
        //         _id: {
        //             $ne: "EASY"
        //         }
        //     }
        // }
    ]);

    res.status(200).json({
        status: 'success',
        data:{
            stats
        }
    });
});

export const getMonthlyPlan = catchAsync(async(req, res, next) => {
    
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group:{
                _id: {
                    $month: '$startDates'
                },
                numTourStarts: {
                    $sum: 1
                },
                tours: {
                    $push: '$name'
                },
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {
                numTourStarts: -1
            }
        },
        {
            $limit: 12
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});