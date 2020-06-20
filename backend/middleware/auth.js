const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // getting the token from authorization header may fail at the first
    // hurdle, eg if authorization header does not exist, so the functionality
    // is wrapped in a try/catch block
    try {
    // Authorization header will be formatted as: "Bearer TOKEN_STRING"
    // we therefore get the authorization header, split by empty string
    // to return an array, and then get the second element, which will 
    // give access to the "TOKEN_STRING" part of the header
    const token = req.headers.authorization.split(' ')[1];
    // jwt.verify takes two arguments: the token, and the secret that
    // is passed when signing the JWT token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // add decodedToken properties to req. This can then be used by any route
    // that calls auth midlleware
    req.user = { email: decodedToken.email, userId: decodedToken.userId }
    next();
    } catch (error) {
        res.status(401).json({ message: "You don't have permission to do that ..." })
    }

}