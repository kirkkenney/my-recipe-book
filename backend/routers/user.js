const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

const User = require('../models/user');


const router = express.Router();


router.post('/signup', (req, res) => {
    if (req.body.username.indexOf(' ') > 0) {
        return res.status(500).json({
            message: 'Username cannot contain spaces.'
        })
    }
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
    user.save()
    .then(result => {
        res.status(201).json({
            success: true,
            message: 'Successfully signed up!',
            result: result
        })
    })
    .catch(err => {
        res.status(500).json({
            success: false,
            message: 'Invalid signup details!'
        })
    })
});

router.get('/checkusername/:username', (req, res) => {
    User.findOne({ username: req.params.username })
    .then(result => {
        if (result) {
            return res.status(200).json({
                user: true
            })
        }
        return res.status(200).json({
            user: false
        })
    })
    .catch(err => {
        res.status(500).json({
            user: false,
            message: 'An unknown error occurred'
        })
    })
});

router.post('/login', (req, res) => {
    let fetchedUser;
    User.findOne({ email: req.body.email })
    .then(user => {
        if (!user) {
            return res.status(404).json({ message: 'No user found with that email address' })
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password)
    })
    .then(result => {
        if (!result) {
            return res.status(401).json({ message: 'Password incorrect' });
        }
        const token = jwt.sign(
            { email: fetchedUser.email, userId: fetchedUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "6hr" }
        );
        res.status(200).json({
            message: 'Successfully logged in',
            token: token,
            expiresIn: 21600,
            userId: fetchedUser._id,
            username: fetchedUser.username
        })
    })
    .catch(err => {
        return res.status(401).json({
            message: 'Invalid login details'
        })
    });
});

router.get('/get-user/:username', (req, res) => {
    const username = req.params.username;
    let savedRecipes = [];
    let createdRecipes = [];
    User.findOne({ username: username })
    .populate({
        path: 'savedRecipes',
        populate: { path: 'creator' }
    })
    .populate({
        path: 'createdRecipes',
        populate: { path: 'creator' }
    })
    .then(user => {
        user.savedRecipes.forEach(recipe => {
            savedRecipes.push({
                instructions: recipe.instructions,
                votes: recipe.votes,
                voters: recipe.voters,
                tags: recipe.tags,
                id: recipe._id,
                name: recipe.name,
                ingredients: recipe.ingredients,
                imgPath: recipe.imgPath,
                creatorId: recipe.creator._id,
                creatorUsername: recipe.creator.username,
                createdAt: recipe.createdAt 
            })
        })
        user.createdRecipes.forEach(recipe => {
            createdRecipes.push({
                instructions: recipe.instructions,
                votes: recipe.votes,
                voters: recipe.voters,
                tags: recipe.tags,
                id: recipe._id,
                name: recipe.name,
                ingredients: recipe.ingredients,
                imgPath: recipe.imgPath,
                creatorId: recipe.creator._id,
                creatorUsername: recipe.creator.username,
                createdAt: recipe.createdAt 
            })
        })
        return res.status(200).json({
            id: user._id,
            username: user.username,
            savedRecipes: savedRecipes,
            createdRecipes: createdRecipes,
            shoppingList: user.shoppingList,
            createdAt: user.createdAt
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: 'Unable to load user information. Please try again later.'
        })
    })
})

router.post('/add-to-shopping-list', auth, (req, res) => {
    User.findByIdAndUpdate(req.user.userId, {
        $push: { shoppingList: req.body.ingredients }
    }, { new: true })
    .then(result => {
        return res.status(200).json({
            shoppingList: result.shoppingList
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: 'Unable to update your shopping list at this time. Please try again later.'
        })
    })
});

router.post('/update-shopping-list', auth, (req, res) => {
    User.findByIdAndUpdate(req.user.userId, {
        shoppingList: req.body.ingredients
    }, { new: true })
    .then(result => {
        return res.status(200).json(result.shoppingList)
    })
    .catch(err => {
        return res.status(500).json({
            message: 'Unable to update shopping list. Please try again later.'
        })
    })
})

module.exports = router;