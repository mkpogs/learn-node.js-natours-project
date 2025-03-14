import jwt from "jsonwebtoken";
import User from "./../models/userModel.js";
import catchAsync from "./../utils/catchAsync.js";

export const signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    const token = jwt.sign( 
        // payload
        {
            id: newUser._id
        },
        // secret
        process.env.JWT_SECRET,

        {
            expiresIn: process.env.JWT_EXPIRES_IN           
        }
    );

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});