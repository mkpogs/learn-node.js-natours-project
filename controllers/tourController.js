//# import fs from 'fs';
//# import { fileURLToPath } from 'url';
//# import { dirname } from 'path';
import Tour from './../models/tourModel.js';


// Create __dirname equivalent in ES module
//# const __filename = fileURLToPath(import.meta.url);
//# const __dirname = dirname(__filename);


// --- Tour Route Handlers

export const aliasTopTours = async(req, res, next) => {
    req.query.limit = '5';
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name,price,difficulty,ratingsAverage,summary";
    next();
}

// Create a new tour
export const createTour = async(req, res) => {
    
    try{
        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });

    } catch(err) {
        res.status(400).json({
            status: 'Fail',
            message: err.message
        });
    }
}

// Fetch all tours
export const getAllTours = async(req, res) => {
    try {

        // Filter by query
        // 1. Build Query
        // 1.1. Filtering
        const queryObj = {...req.query};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1.2. Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        console.log(JSON.parse(queryStr));

        let query = Tour.find(JSON.parse(queryStr));

        // 1.3. Sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join('');
            query = query.sort(req.query.sort);
            // SortBy(price ratingsAverage)
        } else {
            query = query.sort('-createdAt');
        }

        // 1.4. Field Limiting
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ');
            query = query.select('name duration difficulty price');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // 1.5. Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        if(req.query.page){
            const numTours = await Tour.countDocuments();
            if(skip >= numTours) throw new Error('This page does not exist');
        }

        // 2. Execute Query
        const tours = await query;

        // 3. Send Response
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'Fail',
            message: err
        });
    }
    
}

// Fetch Specific tour by ID
export const getTour = async(req, res) => {
    try{
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

    } catch(err){
        res.status(404).json({
            status: 'Fail',
            message: err
        });
    }
}

// PUT - Update all elements of a tour by ID
// PATCH - Update 1 or more elements of a tour by ID
export const updateTour = async(req, res) => {
    try{
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
    } catch(err){
        res.status(404).json({
            status: 'Fail',
            message: err
        });
    }
}

// DELETE - Delete a tour by ID
export const deleteTour = async (req, res) => {
    try{
        await Tour.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
    
}