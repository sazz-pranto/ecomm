const express = require('express');
const bodyParser = require('body-parser');
const usersRepo = require('./repositories/users.js');  // contains UsersRepository

const app = express();
// urlencoded method takes out any html form data and make an object
app.use(bodyParser.urlencoded({ extended: true }));

//this code is similar to how bodyParser code is written
// // middleware funciton->
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

app.get('/', (req, res) => {
    res.send(`
        <div>
            <form method="POST">
            <input name="email" placeholder="email" />
            <input name="password" placeholder="password" />
            <input name="passwordConfirmation" placeholder="password confirmation" />
            <button>Sign Up</button>
            </form>
        </div>
    `);
});

app.post('/', async (req, res) => { // async keyword is used cause usersRepo has await
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

    res.send('Account created!!!');
});

app.listen(3000, () => {
    console.log('Listening');
});