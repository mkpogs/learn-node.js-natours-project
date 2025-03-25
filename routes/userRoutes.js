import express from 'express';
import {
    getAllUsers,
    getMe,
    updateMe,
    deleteMe, 
    createUser, 
    getUser,
    updateUser, 
    deleteUser
} from './../controllers/userController.js';
import { 
    signup, 
    login,
    protect, 
    forgotPassword, 
    resetPassword,
    updatePassword,
    restrictTo
} from "./../controllers/authController.js";

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.patch('/update-my-password', protect, updatePassword);
router.get('/me',
    protect,
    getMe,
    getUser
);
router.patch('/update-me', protect, updateMe);
router.delete('/delete-me', protect, deleteMe);

router.route('/')
    .get(getAllUsers)
    .post(createUser);

    router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

export default router;