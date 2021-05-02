// *******************************************
// to run this script, type "npm run dev" on cli
// *******************************************

const express = require('express');

const bodyParser = require('body-parser');  // bodyParser is a middleware 
const cookieSession = require('cookie-session');  // cookie-session is a middleware function

const authRouter = require('./routes/admin/auth');
const adminProductsRouter = require('./routes/admin/products');  // contains routers for admin
const productsRouter = require('./routes/products'); // contains routers to show products to the users
const cartsRouter = require('./routes/carts'); // contains routers to show carts to the users

const app = express();

app.use(express.static('public')); // exposing the public directories
// urlencoded method takes out any html form data and make an object
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cookieSession({
        keys: ['OglplzxYqD3fKLadkj89fs7mv']  // random key
    })
);
app.use(authRouter);
app.use(adminProductsRouter);
app.use(productsRouter);
app.use(cartsRouter);

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

app.listen(3000, () => {
    console.log('Listening');
});