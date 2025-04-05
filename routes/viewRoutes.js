import express from 'express';
import { 
    getOverview,
    getTour,
    getLoginForm
 } from './../controllers/viewsController.js';

const router = express.Router();


// Rendering VIEWS Routes
router.get('/', getOverview);
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);



export default router;