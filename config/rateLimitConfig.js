import rateLimit from "express-rate-limit";

const apiRateLimiter = rateLimit({
    max: 100, // limit each IP to 100 requests per windowMs
    windowMs: 60 * 60 * 1000, // 1 hour
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers (deprecated)
    message: 'Too many requests from this IP, please try again in an hour!'
});

export default apiRateLimiter;