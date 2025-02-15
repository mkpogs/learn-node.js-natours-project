import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';


// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to Database
connectDB();


// Start Express Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});