const express = require('express');
const bodyParser = require('body-parser');

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

app.post('/', (req, res) => {
    console.log(req.body);
    res.send('Account created!!!');
});

app.listen(3000, () => {
    console.log('Listening');
});