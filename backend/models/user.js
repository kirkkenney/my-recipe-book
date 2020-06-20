const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("That email address doesn't look right")
            }
        }
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    resetToken: {
        type: String
    },
    resetTokenExpiry: {
        type: Date
    },
    savedRecipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    createdRecipes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    shoppingList: {
        type: [String]
    }
}, {
    timestamps: true
})

UserSchema.plugin(uniqueValidator);

UserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next();
})

module.exports = mongoose.model('User', UserSchema)