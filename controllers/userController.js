import multer from 'multer';
import sharp from 'sharp';
import User from './../models/userModel.js';
import catchAsync from './../utils/catchAsync.js';
import AppError from './../utils/appError.js';
import {
    getAll,
    getOne,
    updateOne, 
    deleteOne
 } from './handlerFactory.js';


// ===== Uploading Image using Multer Package
// Destination of uploaded images
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'src/img/users');
//     },
//     filename: (req, file, cb) => {
//         // user-userID-currTimeStamp - user-562dba-465....jpeg
//         // extract the file extension
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// });

// Destination of uploaded images
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

 export const uploadUserPhoto = upload.single('photo');
 
 export const resizeUserPhoto = catchAsync(async(req, res, next) => {
    if(!req.file){
        return next();
    }

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`src/img/users/${req.file.filename}`);

    next();
 }); 

// ===== Functions =====
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
    // console.log(req.file);
    // console.log(req.body);


    // 1. Create error if user POSTs password data
    if (req.body.password || req.body.confirmPassword) {
        return next(new AppError('This route is not for password updates. Please use /update-my-password.', 400));
    }

    // 2. Filtered out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    
    if(req.file){
        filteredBody.photo = req.file.filename;
    }

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