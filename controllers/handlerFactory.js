import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";


// Create
export const createOne = Model => catchAsync(async(req, res, next) => {
    
    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});


// Update
export const updateOne = Model => catchAsync(async(req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('No document found with that ID', 404)); // Handle error with 'next'
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});


// DELETE 
export const deleteOne = Model => catchAsync(async(req,res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No document found with that ID', 404)); // Handle error with 'next'
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});