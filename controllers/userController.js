import User from './../models/userModel.js';
import catchAsync from './../utils/catchAsync.js';
import AppError from './../utils/appError.js';
import {
    getAll,
    getOne,
    updateOne, 
    deleteOne
 } from './handlerFactory.js';

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)){
            newObj[el] = obj[el];
        }
    });

    return newObj;
}


// ===== Route Handlers =====
// Fetching the Current User Data
export const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

// Updating Current User data
export const updateMe = catchAsync(async(req, res, next) => {
    // 1. Create error if user POSTs password data
    if (req.body.password || req.body.confirmPassword) {
        return next(new AppError('This route is not for password updates. Please use /update-my-password.', 400));
    }

    // 2. Filtered out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3. Update user document
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });

});

// Allowing Current User to disable account
export const deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});


export const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! please use /signup instead'
    });
}

// Admin Role
export const getAllUsers = getAll(User);
export const getUser = getOne(User);
export const updateUser = updateOne(User); // Do not Update password with this
export const deleteUser = deleteOne(User);