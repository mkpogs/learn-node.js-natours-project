import AppError from './../utils/appError.js';

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError(`Your token has expired! Please log in again`, 401);

const handleDuplicateFieldsDB = err => {
    const message = `Duplicate field value: "${err.keyValue.name}". Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, req, res) => {
    // API
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }

    // Rendered Website
    console.error('ERROR 💥', err);

    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    });
}

const sendErrorProd = (err, req, res) => {
    // API
    if(req.originalUrl.startsWith('/api')){
        // Operational, trusted error: send message to client
        if(err.isOperational){
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }

        // Programming or other unknown error: don't leak error details
        // 1) Log error
        console.error('ERROR 💥', err);

        // 2) Send generic message
        return res.statusCode(500).json({
            status: 'error',
            message: `Something went wrong!`
        });
    }

    // Rendered Website
    if(err.isOperational){
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }

    // Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
        return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    });
}


export const globalErrorHandler = (err, req, res, next) => {
    console.error('🔥 ERROR:', err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        
        if (err.name === 'CastError') {
            error = handleCastErrorDB(error);
        }

        if(err.code === 11000){
            error = handleDuplicateFieldsDB(error);
        }

        if(err.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }
        if(error.name === 'JsonWebTokenError'){
            error = handleJWTError();
        }
        if(error.name === 'TokenExpiredError'){
            error = handleJWTExpiredError();
        }

        sendErrorProd(error, req, res);
    }
}; 