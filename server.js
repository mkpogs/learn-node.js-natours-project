import './config/config.js'; // Load environment variables first from config.js
import app from './app.js';
import connectDB from './config/db.js';


// Catching Uncaught Exceptions
process.on('uncaughtException', err => {
    console.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

// Connect to Database
connectDB();


// Start Express Server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error(`Unhandled Rejection at: ${promise}. Reason: ${reason}`);
    server.close(() => process.exit(1));
});
