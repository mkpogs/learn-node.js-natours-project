import { promisify } from 'util';
import jwt from "jsonwebtoken";
import User from "./../models/userModel.js";
import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";


const signToken = id => {
    return jwt.sign( 
        // payload
        {
            id
        },
        // secret
        process.env.JWT_SECRET,

        {
            expiresIn: process.env.JWT_EXPIRES_IN           
        }
    );
}

export const signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

export const login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password exist
    if(!email || !password){
        return next(new AppError("Please Provide Email and Password", 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect Email or Password', 401));
    }

    // If everything OK, send token to client
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
});

export const protect = catchAsync(async(req, res, next) => {
    // 1. Getting token & check of it's there
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    // console.log(token);

    if(!token){
        return next(new AppError('You are not logged in! Please log in to get access!.', 401));
    }

    // 2. Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // console.log(decoded);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    // 4. Check if user changed password after the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed Password! Please log in again.', 401));
    }


    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});