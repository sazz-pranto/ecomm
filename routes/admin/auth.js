/* admin's login & signup authentication */
// ***************************************

const express = require('express');

const usersRepo = require('../../repositories/users'); // users.js file
const router = express.Router();
const signupTemplate = require('../../views/admin/auth/signup')  // html for signup
const signinTemplate = require('../../views/admin/auth/signin'); // html for signin
const { handleErrors } = require('./middlewares');

const { 
    requireEmail,
    requirePassword, 
    requirePasswordConfirmation,
    requireEmailExists,
    requireValidPassword
} = require('./validators'); // runs validation check for registering and logging in users

// signup page
router.get('/signup', (req, res) => {
    res.send(signupTemplate({ req: req }));  // passing the req object as an argument
});

// post request handler for the form submission from signup page
router.post(
    '/signup',
    [ requireEmail, requirePassword, requirePasswordConfirmation ], // validation checks
    handleErrors(signupTemplate), // reference to the sign up template is passed so that it can be called by the middleware when necessary
    async (req, res) => {
        const { email, password } = req.body;

        // create a user
        const user = await usersRepo.create({ email: email, password: password });

        /* req.session is added by the cookie-session library, it is basically an object and also 
        more properties can be added to this object. Here userId is added. If any custom property like this
        is added and a response is sent, the cookie-session library takes a look at the req.session object
        and checks if any information(here property) is changed, it takes that info and encode it into a simple string
        attach it as the outgoing response as the cookie that should be stored on the user's browser
        Here, we are adding the id of the signed in user inside the userId property, which will eventually added to the 
        user's browser as a cookie, all handled by the cookie-session module */
        req.session.userId = user.id;  
        /* cookie-session adds a session property to the incoming request object when a response is sent
        to recognize a user, here the user's id is being stored to a cookie */
        res.redirect('/admin/products');
    }
);

// signout page
router.get('/signout', (req, res) => {
    // erase the current user's session
    req.session = null;
    res.send('You are signed out');
});

// signin page
router.get('/signin' ,(req, res) => {
    // signin form
    res.send(signinTemplate({})); 
    /* here an empty object is passed in signinTemplate so that errors object in signin.js file
    will try to destructure errors object and if there's no object and if there's no object to destructure 
    an error is going to show up */
});

// post request handler for the signin form from signin page
router.post(
    '/signin',
    [ requireEmailExists, requireValidPassword ], // validation checks
    handleErrors(signinTemplate), // reference to the sign in template is passed so that it can be called by the middleware when necessary
    async (req, res) => {
        const { email } = req.body;
        
        const user = await usersRepo.getOneBy({ email: email });
        // if user's email and password are valid, set a cookie for the user using its id
        req.session.userId = user.id;
        res.redirect('/admin/products');
    }
);

module.exports = router;