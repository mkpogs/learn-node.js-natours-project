import AppError from './../utils/appError.js';

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const message = `Duplicate field value: "${err.keyValue.name}". Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else { // Programming or other unknown error: don't leak error details
        // 1) Log error
        console.error('ERROR 💥', err);

        // 2) Send generic message
        res.statusCode(500).json({
            status: 'error',
            message: `Something went wrong!`
        });
    }
}


export const globalErrorHandler = (err, req, res, next) => {
    console.error('🔥 ERROR:', err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        
        if (err.name === 'CastError') {
            error = handleCastErrorDB(error);
        }

        if(err.code === 11000){
            error = handleDuplicateFieldsDB(error);
        }

        if (err.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }

        sendErrorProd(error, res);
    }
};