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
        passwordConfirm: req.body.passwordConfirm
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