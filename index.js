const express = require('express');
const bodyParser = require('body-parser');  // bodyParser is a middleware 
const cookieSession = require('cookie-session');  // cookie-session is a middleware function

const usersRepo = require('./repositories/users.js');  // contains UsersRepository
const users = require('./repositories/users.js');

const app = express();
// urlencoded method takes out any html form data and make an object
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cookieSession({
        keys: ['OglplzxYqD3fKLadkj89fs7mv']
    })
);

//this code is similar to how bodyParser code is written
// // middleware function->
// const bodyParser = (req, res, next) => {
//     if(req.method === 'POST') {
//         req.on('data', (data) => {
//             const parsed = data.toString('utf-8').split('&');
//             const formData = {};
//             for(let pair of parsed) {
//                 const [key, value] = pair.split('='); // array destructuring, first item of pair array goes in key and second item goes in value
//                 formData[key] = value;
//             }
//             req.body = formData;
//             next(); // next method calls the next route handler (if available)
//         });
//     } else {
//         next();
//     }
// };

// signup page
app.get('/signup', (req, res) => {
    res.send(`
        <div>
            Your ID is: ${req.session.userId}
            <form method="POST">
            <input name="email" placeholder="email" />
            <input name="password" placeholder="password" />
            <input name="passwordConfirmation" placeholder="password confirmation" />
            <button>Sign Up</button>
            </form>
        </div>
    `);
});

// post request handler for the form submission from signup page
app.post('/signup', async (req, res) => { // async keyword is used cause usersRepo has await
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
app.get('/signout', (req, res) => {
    // erase the current user's session
    req.session = null;
    res.send('You are signed out');
});

// signin page
app.get('/signin' ,(req, res) => {
    // signin form
    res.send(`
        <div>
            <form method="POST">
            <input name="email" placeholder="email" />
            <input name="password" placeholder="password" />
            <button>Sign In</button>
            </form>
        </div>
    `);
});

// post request handler for the signin form from signin page
app.post('/signin', async (req, res) => {
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
})
app.listen(3000, () => {
    console.log('Listening');
});