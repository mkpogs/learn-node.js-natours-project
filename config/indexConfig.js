import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import cookieParser from "cookie-parser";
import helmetCSP from "./helmetConfig.js";
import { corsMiddleware, corsPreflight } from "./corsConfig.js";
import apiRateLimiter from "./rateLimitConfig.js";
import hppMiddleware from "./hppConfig.js";

const expressSetupMiddleware = app => {

    // CORS
    app.use(corsMiddleware);
    /*
       - But… for full support (especially for non-simple requests like POST with cookies), you may also want to handle preflight OPTIONS requests:
    
       - This ensures that all preflight (CORS "check") requests get the correct headers too, which can prevent weird issues.
    */
    app.options('*', corsPreflight); // Enable preflight for all routes

    // Set Security HTTP headers
    app.use(helmetCSP);

    // Limit request from same API
    app.use('/api', apiRateLimiter);

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
    app.use(hppMiddleware);

    // Custom middleware to attach request time
    app.use((req, res, next) => {
        req.requestTime = new Date().toISOString();
        next();
    });
}

export default expressSetupMiddleware;