import express from 'express';
import {
    getAllUsers, 
    createUser, 
    getUser, updateUser, 
    deleteUser
} from './../controllers/userController.js';
import { signup } from "./../controllers/authController.js";

const router = express.Router();

router.post('/signup', signup);

router.route('/')
    .get(getAllUsers)
    .post(createUser);

    router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

export default router;