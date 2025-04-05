import crypto from "crypto";
import { promisify } from 'util';
import jwt from "jsonwebtoken";
import User from "./../models/userModel.js";
import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";
import sendEmail from "./../utils/email.js";


// ===== Functions =====
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

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    // 👇 DEBUG: log cookie options
    console.log('Cookie Options:', cookieOptions);

    if(process.env.NODE_ENV === 'production'){
        cookieOptions.secure = true
    }

    res.cookie('jwt', token, cookieOptions);

    // Remove the password from the output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}


// ===== Route Handler =====
export const signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create(req.body);

    createSendToken(newUser, 201, res);
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
    createSendToken(user, 200, res);
});

export const protect = catchAsync(async(req, res, next) => {
    // 1. Getting token & check of it's there
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.jwt){
        token = req.cookies.jwt;
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
    if (await currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed Password! Please log in again.', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'lead-guide']
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    }
}

export const forgotPassword = catchAsync(async(req, res, next) => {
    // 1. Get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if(!user){
        return next(new AppError('There is no user with that email address.', 404));
    }

    // 2. Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3. Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}. \n If you didn't forget your password, please ignore this email!`;

    try{
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token is (valid for 10 minutes).',
            message
        });
    
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
});

export const resetPassword = catchAsync(async(req, res, next) => {
    // 1. Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({ 
        passwordResetToken: hashedToken,
        passwordResetExpires: { 
            $gt: Date.now() 
        }
    });

    // 2. If token has not expired, and there is user, set the new password
    if(!user){
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3. Update changedPasswordAt property for the current user
    // 4. Log the user in, send JWT
    createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async(req, res, next) => {
    // 1. Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2. Check if POSTED current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is wrong', 401));
    }

    // 3. If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4. Log user in, send JWT
    createSendToken(user, 200, res);
});

// Only for Rendered Pages, no errors!
export const isLoggedIn = catchAsync(async(req, res, next) => {
    if (req.cookies.jwt){
        // Verify token
        const decoded = await promisify(jwt.verify)(
            req.cookies.jwt, 
            process.env.JWT_SECRET
        );
    
        // Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if(!currentUser){
            return next();
        }
    
        // Check if user changed password after the token was issued
        if (await currentUser.changedPasswordAfter(decoded.iat)) {
            return next();
        }
    
        // There is a logged in user
        res.locals.user = currentUser;
        return next(); 
    }
    next();
});