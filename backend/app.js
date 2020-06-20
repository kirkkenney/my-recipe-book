const express = require('express');
require('./db/mongoose');
const bodyParser = require('body-parser');
const path = require('path')

const userRoutes = require('./routers/user');
const recipeRoutes = require('./routers/recipe');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// images are stored server-side. By default, Express prevents requests
// from passing to this folder. The below middleware allows requests to
// the /images folder to continue uninterupted
app.use('/images', express.static(path.join('images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods', 
        'GET, POST, PATCH, PUT, DELETE, OPTIONS'
    );
    next();
});

app.use("/api/recipe", recipeRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || '3000';

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})