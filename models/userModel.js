import mongoose from "mongoose";
import slugify from "slugify";
import validator from "validator";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Input your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Please Provide a password!'],
        minLength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password!'],
        minLength: 8
    }
});

const User = mongoose.model('User', userSchema);

export default User;