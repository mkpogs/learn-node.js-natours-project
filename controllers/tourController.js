//# import fs from 'fs';
//# import { fileURLToPath } from 'url';
//# import { dirname } from 'path';
import multer from 'multer';
import sharp from 'sharp';
import Tour from './../models/tourModel.js';
import APIFeatures from './../utils/apiFeatures.js';
import catchAsync from './../utils/catchAsync.js';
import AppError from './../utils/appError.js';
import {
    createOne,
    getAll,
    getOne,
    updateOne, 
    deleteOne 
} from './handlerFactory.js';


// ===== Uploading Image using Multer Package
const multerStorage = multer.memoryStorage();

// Validating Upload if it is an image
const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload only images', 404), 
            false);
    }
}

 const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
 });

 export const uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 } 
 ])

//  upload.single('imageCove'); req.file
//  upload.array('images', 5);  req.files

export const resizeTourImages = catchAsync(async(req, res, next) => {
    // console.log(req.files);

    if(!req.files.imageCover || !req.files.images) {
        return next();
    }

    // 1) Cover Image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`src/img/tours/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async(file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

            await sharp(file.buffer)
                    .resize(2000, 1333)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(`src/img/tours/${filename}`);
            
            req.body.images.push(filename);
        })
    );
    next();
});


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
export const getAllTours = getAll(Tour)

// Fetch Specific tour by ID
export const getTour = getOne(Tour, { path: 'reviews' });

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

// /tours-within/233/center/34.111745,-118.113491/unit/mi
export const getToursWithin = catchAsync(async(req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng) {
        next(new AppError('Please provide latitude and longtitude in the format lat,lng.', 400));
    }

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});

export const getDistances = catchAsync(async(req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng) {
        next(new AppError('Please provide latitude and longtitude in the format lat,lng.', 400));
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: { 
                    type: 'Point', 
                    coordinates: [lng  * 1, lat * 1] 
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});