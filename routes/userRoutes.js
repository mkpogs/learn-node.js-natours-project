import express from 'express';
import {
    getAllUsers, 
    createUser, 
    getUser, updateUser, 
    deleteUser
} from './../controllers/userController.js';
import { 
    signup, 
    login, 
    forgotPassword, 
    resetPassword 
} from "./../controllers/authController.js";

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.route('/')
    .get(getAllUsers)
    .post(createUser);

    router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

export default router;