import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";
import APIFeatures from "./../utils/apiFeatures.js";


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

// Read All or Fetch ALl
export const getAll = Model => catchAsync(async(req, res, next) => {

    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if(req.params.tourId) filter = {tour: req.params.tourId};

    // Execute Query
    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    // const doc = await features.query.explain();
    const doc = await features.query;

    // Send Response
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
});

// Read One or Fetch Specific by ID
export const getOne = (Model, populateOptions) => catchAsync(async(req, res, next) => {

    let query = Model.findById(req.params.id);
    if(populateOptions) query = query.populate(populateOptions);

    const doc = await query;      

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