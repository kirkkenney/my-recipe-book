const express = require('express');
const auth = require('../middleware/auth');

const Recipe = require('../models/recipe');
const User = require('../models/user')

const router = express.Router();

router.get('/id', (req, res) => {
    const id = req.query.id;
    Recipe.findById(id).populate('creator')
    .then(result => {
        return res.status(200).json({
            id: result._id,
            name: result.name,
            ingredients: result.ingredients,
            instructions: result.instructions,
            tags: result.tags,
            votes: result.votes,
            voters: result.voters,
            imgPath: result.imgPath,
            creatorUsername: result.creator.username,
            creatorId: result.creator._id,
            createdAt: result.createdAt
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: 'Unable to get recipe. Please try again later.'
        })
    })
})

router.get('/recent', (req, res) => {
    let recipes = [];
    Recipe.find().sort({createdAt: -1}).limit(5)
    .then(result => {
        result.forEach(recipe => {
            recipes.push({
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
        return res.status(200).json(recipes)
    })
    .catch(err => {
        return res.status(500).json({
            message: 'Could not load recipes. Please try again later.'
        })
    })
});

router.get('', (req, res) => {
    const skipOption = +req.query.skipOption;
    const sortBy = (req.query.sortBy == 'New') ? 'createdAt' : 'votes'
    let fetchedRecipes = [];
    Recipe.find().sort({ [sortBy]: -1 }).skip(skipOption).limit(10).populate('creator')
    .then(documents => {
        documents.forEach(document => {
            fetchedRecipes.push({
                id: document._id,
                name: document.name,
                ingredients: document.ingredients,
                instructions: document.instructions,
                tags: document.tags,
                votes: document.votes,
                voters: document.voters,
                imgPath: document.imgPath,
                creatorUsername: document.creator.username,
                creatorId: document.creator._id,
                createdAt: document.createdAt
            })
        })
        return res.status(200).json(fetchedRecipes)
    })
    .catch(err => {
        return res.status(500).json({
            message: 'Unable to get recipes. Please try again later.'
        })
    })
});

router.get('/tag', (req, res) => {
    const skipOption = +req.query.skipOption;
    const tag = req.query.tag;
    const sortBy = (req.query.sortBy == 'New') ? 'createdAt' : 'votes'
    let fetchedRecipes = [];
    Recipe.find({ tags: tag }).sort({ [sortBy]: -1 }).skip(skipOption).limit(5).populate('creator')
    .then(documents => {
        documents.forEach(document => {
            fetchedRecipes.push({
                id: document._id,
                name: document.name,
                ingredients: document.ingredients,
                instructions: document.instructions,
                tags: document.tags,
                votes: document.votes,
                voters: document.voters,
                imgPath: document.imgPath,
                creatorUsername: document.creator.username,
                creatorId: document.creator._id,
                createdAt: document.createdAt               
            })
        })
        return res.status(200).json(fetchedRecipes)
    })
    .catch(err => {
        return res.status(500).json({
            message: 'Unable to get recipes. Please try again later.'
        })
    })
})

router.post('/create-recipe', auth, (req, res) => {
    const defaultImgUrl = `${req.protocol}://${req.get('host')}/images/defaultimg.png`;
    const recipe = new Recipe({
        name: req.body.name,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        tags: req.body.tags,
        imgPath: req.body.imgPath.length > 0 ? req.body.imgPath : defaultImgUrl,
        creator: req.user.userId,
        votes: 1,
        voters: [req.user.userId]
    })
    recipe.save()
    .then(result => {
        result.populate('creator', (err) => {
            if (err) {
                return res.status(500).json({
                    message: 'An unknown error occurred. Please try again later'
                })
            } else {
                const user = User.findByIdAndUpdate(req.user.userId, {
                    $push: { createdRecipes: result._id }
                })
                .then(userResult => {
                    return res.status(200).json({
                            name: result.name,
                            ingredients: result.ingredients,
                            instructions: result.instructions,
                            tags: result.tags,
                            votes: result.votes,
                            voters: result.voters,
                            imgPath: result.imgPath,
                            creatorUsername: result.creator.username,
                            creatorId: result.creator._id,
                            createdAt: result.createdAt,
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        message: 'An unknown error occurred. Please try again later'
                    })
                })
            }
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: 'An unknown error occurred. Please try again later'
        })
    })
});

router.post('/add-to-favourites', auth, (req, res) => {
    const id = req.body.id;
    Recipe.findByIdAndUpdate(id, {
        $inc: { votes: 1 },
        $push: { voters: req.user.userId }
    }, { new: true }).populate('creator')
    .then(result => {
        User.findByIdAndUpdate(req.user.userId, {
            $push: { savedRecipes: id }
        }, { new: true })
        .then(userResult => {
            return res.status(200).json({
                instructions: result.instructions,
                votes: result.votes,
                voters: result.voters,
                tags: result.tags,
                id: result._id,
                name: result.name,
                ingredients: result.ingredients,
                imgPath: result.imgPath,
                creatorId: result.creator._id,
                creatorUsername: result.creator.username,
                createdAt: result.createdAt 
            })
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: 'Unable to add to your favourites right now. Please try again later.'
        })
    })
});

router.post('/remove-from-favourites', auth, (req, res) => {
    const id = req.body.id;
    Recipe.findByIdAndUpdate(id, {
        $inc: { votes: -1 },
        $pull: { voters: req.user.userId }
    }, { new: true }).populate('creator')
    .then(result => {
        User.findByIdAndUpdate(req.user.userId, {
            $pull: { savedRecipes: id }
        }, { new: true })
        .then(userResult => {
            return res.status(200).json({
                instructions: result.instructions,
                votes: result.votes,
                voters: result.voters,
                tags: result.tags,
                id: result._id,
                name: result.name,
                ingredients: result.ingredients,
                imgPath: result.imgPath,
                creatorId: result.creator._id,
                creatorUsername: result.creator.username,
                createdAt: result.createdAt 
            }) 
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: 'Unable to remove from your favourites right now. Please try again later.'
        })
    })
});

router.post('/delete-recipe', auth, (req, res) => {
    const id = req.body.id;
    Recipe.findById(id).populate('creator')
    .then(recipe => {
        if (recipe.creator._id != req.user.userId) {
            return res.status(500).json({
                message: 'You do not have permission to do that.'
            })
        }
        User.findByIdAndUpdate(req.user.userId, {
            $pull: { createdRecipes: recipe._id }
        })
        .then(updated => {
            User.updateMany(
                { savedRecipes: recipe._id },
                { $pull: { savedRecipes: recipe._id } }
            )
            .then(usersUpdated => {
                Recipe.findByIdAndDelete(id)
                .then(deleted => {
                    return res.status(200).json({
                        message: 'Recipe successfully deleted.'
                    })
                })
            })
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: 'Unable to delete recipe. Please try again later.'
        })
    })
});

router.post('/edit-recipe', auth, (req, res) => {
    const id = req.body.id
    Recipe.findById(id).populate('creator')
    .then(recipe => {
        if (recipe.creator._id != req.user.userId) {
            return res.status(500).json({
                success: false,
                message: 'You do not have permission to do that'
            })
        }
        Recipe.findByIdAndUpdate(id, {
            instructions: req.body.instructions,
            ingredients: req.body.ingredients,
            imgPath: req.body.imgPath,
            name: req.body.name,
            tags: req.body.tags
        })
        .then(updated => {
            return res.status(200).json({
                success: true,
                message: 'Recipe successfully updated'
            })
        })
    })
    .catch(err => {
        return res.status(500).json({
            message: 'Unable to edit recipe at this time. Please try again later.'
        })
    })
})

module.exports = router;