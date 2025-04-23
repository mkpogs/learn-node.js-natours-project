import './config/config.js'; // Load environment variables first from config.js
import path from 'path';
import express from 'express';
import morgan from 'morgan';
import AppError from './utils/appError.js';
import { globalErrorHandler } from './controllers/errorController.js';
import getDirname from './config/dirname.js';
import expressSetupMiddleware from './config/indexConfig.js';
import allRoutes from './routes/indexRoutes.js';



const app = express();

// Create __dirname equivalent in ES module
const __dirname = getDirname(import.meta.url);

// Setting up PUG Engine in Express
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


// ===== Global Middleware
// Serving a static file
// app.use(express.static(`${__dirname}/src`)); 
app.use(express.static(path.join(__dirname, 'src'))); // Serve everything in 'src/' directory

// This code will prevent the browser from throwing the "can't find" error by simply sending an empty response with status 204 when .map files are requested.
app.get('*.js.map', (req, res) => {
  console.log(`Source map requested: ${req.originalUrl}`);
  res.status(204).send();
});

// Development Logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// Express Configs Middleware
expressSetupMiddleware(app);


// Mounting Routes
app.use(allRoutes);


// Handling Unhandled Routes
app.all('*', (req,res, next) => {
    
    next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
});


app.use(globalErrorHandler);

export default app;