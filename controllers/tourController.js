//# import fs from 'fs';
//# import { fileURLToPath } from 'url';
//# import { dirname } from 'path';
import Tour from './../models/tourModel.js';
import APIFeatures from './../utils/apiFeatures.js';
import catchAsync from './../utils/catchAsync.js';


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
export const createTour = catchAsync(async(req, res) => {
    
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });
});

// Fetch all tours
export const getAllTours = catchAsync(async(req, res) => {

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
export const getTour = catchAsync(async(req, res) => {
    const tour = await Tour.findById(req.params.id);
                    // Tour.findOne({_id:req.params.id});
                    // Tour.findById(req.params.id);

    if(tour){
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } else {
        res.status(404).json({
            status: 'Fail',
            message: 'Tour Not Found'
        });
    }
});

// PUT - Update all elements of a tour by ID
// PATCH - Update 1 or more elements of a tour by ID
export const updateTour = catchAsync(async(req, res) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(tour){
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } else {
        res.status(404).json({
            status: 'Fail',
            message: 'Tour Not Found'
        });
    }
});

// DELETE - Delete a tour by ID
export const deleteTour = catchAsync(async (req, res) => {
    
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
    
});

export const getTourStats = catchAsync(async(req, res) => {
    
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

export const getMonthlyPlan = catchAsync(async(req, res) => {
    
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