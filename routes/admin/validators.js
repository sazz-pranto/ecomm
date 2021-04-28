/* destructuring check function from express-validator module to send errors on the form for wrong email or password
to check if any form data is valid, we need to pass the names of the input fields as an argument, and the list of checks
to be executed is passed in an array inside a request handler, like- app.post('/', [
    check('username').isEmail(), check('password').isLength(....properties to check...)
] */
const { check } = require('express-validator');

const usersRepo = require('../../repositories/users'); // users.js file

// export the validator middleware
module.exports = {
    // product creation validation checks:-
    requireTitle:
        check('title')
            .trim()
            .isLength({ min: 3, max: 40 })
            .withMessage('Must be between 3 and 40 characters!'),
    requirePrice:
        check('price')
            .trim()
            .toFloat()
            .isFloat({ min: 1 })
            .withMessage('Price must be at least 1!'),
    // signup validation checks:-
    requireEmail: 
        check('email') // sanitizing(triming & normalization) and validating email
            .trim()
            .normalizeEmail()
            .isEmail()
            .withMessage('Must be a valid email')
            .custom(async (email) => {
                // checking if the email is already in use, its a custom check
                /* getOneBy requires a filter object as param, here the email
                property is given to see if this email is already in use or not
                getOneBy has some async functionality, so await is used */
                const existingUser = await usersRepo.getOneBy({ email: email });

                if(existingUser) {
                    // if there's already an user with this email,
                    throw new Error('Email is already in use!');
                }
            }),
    requirePassword: 
        check('password')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Must be between 4 and 20 characters'),  // sanitizing(trimming & normalization) and validating password
    requirePasswordConfirmation:
        check('passwordConfirmation')
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage('Must be between 4 and 20 characters')
            .custom((passwordConfirmation, { req }) => {
                if(passwordConfirmation !== req.body.password) {
                    // if passwords do not match,
                    throw new Error ('Passwords must match');
                }
            }),
    // signin validation checks:-
    requireEmailExists: 
        check('email') // sanitizing(triming & normalization) and validating email
            .trim()
            .normalizeEmail()
            .isEmail()
            .withMessage('Must be a valid email')
            .custom(async (email) => {
                /* getOneBy requires a filter object as param, here the email
                property is given to see if this email is already in use or not
                getOneBy has some async functionality, so await is used */
                const user = await usersRepo.getOneBy({ email: email });
                if(!user) {
                    // if there's no user with this email, send this
                    throw new Error('Email not found!');
                }
            }),
    requireValidPassword:
        check('password')
            .trim()
            .custom(async (password, { req }) => {
                const user = await usersRepo.getOneBy({ email: req.body.email});
                if(!user) {
                    throw new Error('wrong password');
                }
                // password validation, will be true if password matches the stored one
                const validPassword = await usersRepo.comparePassword(
                    user.password,
                    password
                );

                if(!validPassword) {
                    // if password is wrong, send this
                    throw new Error('Invalid password!');
                }
            })
};