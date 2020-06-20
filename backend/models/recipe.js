const mongoose = require('mongoose');
const path = require('path');

const RecipeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    imgPath: {
        type: String,
        required: true
    },
    ingredients: {
        type:[String],
        required: true
    },
    instructions: {
        type:[String],
        required: true
    },
    votes: {
        type: Number,
        default: 0
    },
    voters: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    },
    tags: {
        type: [String],
        default: [],
        maxlength: 5
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

// RecipeSchema.pre('remove', function (next) {
//     const recipe = this;
//     await User.findOneAndUpdate
//     next();
// })

module.exports = mongoose.model('Recipe', RecipeSchema)