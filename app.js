import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';

dotenv.config({
    path: './config.env'
});


const app = express();

// Create __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// 1. Middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
app.use(express.json());


app.use(express.static(`${__dirname}/src`)); // Serving a static file
app.use((req, res, next) => {
    console.log(`Hello from the middleware 👋`);
    next();
});
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// Mounting Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

export default app;
