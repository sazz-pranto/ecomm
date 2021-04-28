const express = require('express');
/* multer is used to handle file uploads since body parser cant do it, it also parses all the text fields
    inside the post request body like body parser does */
const multer = require('multer');

const productsRepo = require('../../repositories/products');  // products class
const productsNewTemplate = require('../../views/admin/products/new'); // template for adding new product
const productsIndexTemplate = require('../../views/admin/products/index'); // template to show all products
const { requireTitle, requirePrice } = require('./validators');
const { handleErrors, requireAuth } = require('./middlewares');  // requireAuth requires an admin to log in

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// products
router.get('/admin/products', 
    requireAuth, 
    async (req, res) => {
        const products = await productsRepo.getAll();
        res.send(productsIndexTemplate({ products: products }));
});

// new product creation form
router.get('/admin/products/new', 
    requireAuth, 
    (req, res) => {
    res.send(productsNewTemplate({}));
});

// handle form submission for a new product creation
router.post('/admin/products/new',
    requireAuth,
    upload.single('image'),
    [requireTitle, requirePrice], // validation checks
    handleErrors(productsNewTemplate), // reference to the new product's template is passed so that it can be called by the middleware when necessary
    async (req, res) => {
        const image = req.file.buffer.toString('base64');
        const { title, price } = req.body;
        await productsRepo.create({ title, price, image }); // create a product using its attributes
        res.redirect('/admin/products/'); // redirect the admin to the products list page whenever a products is created
});

module.exports = router;