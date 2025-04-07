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
    logout,
    protect, 
    forgotPassword, 
    resetPassword,
    updatePassword,
    restrictTo
} from "./../controllers/authController.js";

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.use(protect);

// -- For User
router.patch(
    '/update-my-password', 
    updatePassword
);
router.get(
    '/me',
    getMe,
    getUser
);
router.patch('/update-me', updateMe);
router.delete('/delete-me', deleteMe);

// -- For Admin
router.use(restrictTo('admin'));
router.route('/')
    .get(getAllUsers)
    .post(createUser);

    router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

export default router;