/* amdin's login & signup authentication */
// ***************************************

const express = require('express');
const usersRepo = require('../../repositories/users'); // users.js file
const router = express.Router();
const signupTemplate = require('../../views/admin/auth/signup')  // html for signup
const signinTemplate = require('../../views/admin/auth/signin'); // html for signin

// signup page
router.get('/signup', (req, res) => {
    res.send(signupTemplate({ req: req }));  // passing the req object as param
});

// post request handler for the form submission from signup page
router.post('/signup', async (req, res) => { // async keyword is used cause usersRepo has await
    const { email, password, passwordConfirmation } = req.body;

    /* getOneBy requires a filter object as param, here the email
    property is given to see if this email is already in use or not
    getOneBy has some async functionality, so await is used */
    const existingUser = await usersRepo.getOneBy({ email: email });

    if(existingUser) {
        // if there's already an user with this email, send this
        return res.send('Email is already in use!');
    }
    if(password !== passwordConfirmation) {
        // if passwords do not match, send this
        return res.send('Passwords must match');
    }

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
    res.send('Account created!!!');
});

// signout page
router.get('/signout', (req, res) => {
    // erase the current user's session
    req.session = null;
    res.send('You are signed out');
});

// signin page
router.get('/signin' ,(req, res) => {
    // signin form
    res.send(signinTemplate());
});

// post request handler for the signin form from signin page
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    /* getOneBy requires a filter object as param, here the email
    property is given to see if this email is already in use or not
    getOneBy has some async functionality, so await is used */
    const user = await usersRepo.getOneBy({ email: email });
    if(!user) {
        // if there's no user with this email, send this
        return res.send('Email not found!');
    }
    
    // password validation, will be true if password matches the stored one
    const validPassword = await usersRepo.comparePassword(
        user.password,
        password
    );

    if(!validPassword) {
        // if password is wrong, send this
        return res.send('Wrong password!');
    }

    // if user's email and password are valid, set a cookie for the user using its id
    req.session.userId = user.id;
    res.send('You are signed in');
});

module.exports = router;