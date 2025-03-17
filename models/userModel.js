import mongoose from "mongoose";
import slugify from "slugify";
import validator from "validator";
import bcrypt from "bcryptjs";

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
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please Provide a password!'],
        minLength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password!'],
        validate: {
            // Only Works on CREATE or SAVE !!!
            validator: function(el){
                return el === this.password;
            },
            message: 'Password does not match!'
        }
    },
    passwordChangedAt: {
        type: Date
    }
});

userSchema.pre('save', async function(next){
    // Only run this function if password was actually modified
    if(!this.isModified('password')){
        return next();
    }

    //  Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Set passwordChangedAt only if updating an existing user
    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000; // Ensure JWT is issued after password change
    }

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;

    next();
});

// Instance method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
        return JWTTimestamp < changedTimestamp;
    }

    // FALSE means NOT changed
    return false;
}

const User = mongoose.model('User', userSchema);

export default User; 