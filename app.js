import './config/config.js'; // Load environment variables first from config.js
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from "xss-clean";
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import AppError from './utils/appError.js';
import { globalErrorHandler } from './controllers/errorController.js'
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import viewRouter from './routes/viewRoutes.js';

const app = express();

// Create __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setting up PUG Engine in Express
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


// 1. Global Middleware
// Serving a static file
// app.use(express.static(`${__dirname}/src`)); 
app.use(express.static(path.join(__dirname, 'src'))); // Serve everything in 'src/' directory

app.use(cors({
  origin: ['http://127.0.0.1:8000', 'http://localhost:8000'],
  credentials: true // if you're using cookies or Authorization headers
}));

/*
   - But… for full support (especially for non-simple requests like POST with cookies), you may also want to handle preflight OPTIONS requests:

   - This ensures that all preflight (CORS "check") requests get the correct headers too, which can prevent weird issues.
*/
app.options('*', cors({
  origin: ['http://127.0.0.1:8000', 'http://localhost:8000'],
  credentials: true
}));



// Set Security HTTP headers
// app.use(helmet());
app.use(
    // For not blocking the mapBox
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://events.mapbox.com'
        ],
        scriptSrcElem: [
          "'self'",
          'https://api.mapbox.com',
          'https://events.mapbox.com'
        ],
        workerSrc: [
          "'self'",
          'blob:'
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://api.mapbox.com',
          'https://fonts.googleapis.com'
        ],
        styleSrcElem: [
          "'self'",
          "'unsafe-inline'",
          'https://api.mapbox.com',
          'https://fonts.googleapis.com'
        ],
        fontSrc: [
          "'self'",
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com'
        ],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://api.mapbox.com',
          'https://events.mapbox.com'
        ],
        connectSrc: [
          "'self'",
          'http://localhost:8000',   // your API
          'http://127.0.0.1:8000',
          'ws://127.0.0.1:*',        // Parcel's hot reload WebSocket
          'https://api.mapbox.com',
          'https://events.mapbox.com'
        ],

        frameSrc: ["'none'"],
        childSrc: ["'self'"],
        manifestSrc: ["'self'"],
        mediaSrc: ["'self'"]
      }
    })
);
  
  

// Development Logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Parse cookies
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration',
        'maxGroupSize',
        'difficulty',
        'ratingsAverage',
        'ratingsQuantity',
        'price',
        'sort'
    ]
}));



// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
});

// Mounting Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/reviews', reviewRouter);


// Handling Unhandled Routes
app.all('*', (req,res, next) => {
    
    next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
});


app.use(globalErrorHandler);

export default app;