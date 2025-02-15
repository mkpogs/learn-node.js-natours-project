import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import connectDB from './../../config/db.js';
import Tour from './../../models/tourModel.js'


// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to Database
connectDB();

// Create __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read JSON File
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// Import Data Into DB
const importData = async () => {
    try{
        await Tour.create(tours);
        console.log("Data is successfully Loaded!");
    } catch (err){
        console.log(err);
    }
    process.exit();
}

//  Delete All data from DB
const deleteData = async () => {
    try{
        await Tour.deleteMany();
        console.log("Data is successfully Deleted!");
    } catch (err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2] === '--import'){
    importData();
} else if (process.argv[2] === '--delete'){
    deleteData();
}

console.log(process.argv);