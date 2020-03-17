const jwt = require('jsonwebtoken');

module.exports = {
    isAuth: (req, res, next) => {
        try {
            const authHeader = req.get('Authorization');
            if (!authHeader) {
                const error = new Error('Authorization Header is Required');
                error.statusCode = 422;
                // noinspection ExceptionCaughtLocallyJS
                throw error;
            }
            const token = authHeader.split(' ')[1]; // undefined or empty => false, not empty => true
            let decodedToken;
            decodedToken = jwt.verify(token, `${process.env.JWT_PASSWORD}`);
            if (!decodedToken) {
                const error = new Error('Not Authenticated!');
                error.statusCode = 422;
                // noinspection ExceptionCaughtLocallyJS
                throw error;
            }
            req.userId = decodedToken.userId;
            req.role = decodedToken.userRole;
            next();
        } catch (err) { 
            if (!err.statusCode) err.statusCode = 500;
            next(err);
        }
    }
};