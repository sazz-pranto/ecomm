const express = require('express');
/* multer is used to handle file uploads since body parser cant do it, it also parses all the text fields
    inside the post request body like body parser does */
const multer = require('multer');

const productsRepo = require('../../repositories/products');  // products class
const productsNewTemplate = require('../../views/admin/products/new'); // template for adding new product
const productsIndexTemplate = require('../../views/admin/products/index'); // template to show all products
const productsEditTemplate = require('../../views/admin/products/edit'); // template to edit a product
const { requireTitle, requirePrice } = require('./validators');
const { handleErrors, requireAuth } = require('./middlewares');  // requireAuth requires an admin to log in
const products = require('../../views/admin/products/index');

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

// editing a product
router.get('/admin/products/:id/edit', requireAuth, async (req, res) => {
    const product = await productsRepo.getOne(req.params.id);
    if(!product) {
        return res.send('Product not found!');
    }
    return res.send(productsEditTemplate({ product: product }));
});

// hangling post request for editing a product
router.post('/admin/products/:id/edit',
    requireAuth,
    upload.single('image'),
    [requireTitle, requirePrice], // validation checks
    handleErrors(
        productsEditTemplate, // reference to the new product's template is passed so that it can be called by the middleware when necessary
        async(req) => {
            /* this optional callback returns the product object that occured an error, it is required only when 
            an error occurs while editing */
            const product = await productsRepo.getOne(req.params.id);
            return { product: product };
        }
    ),
    async (req, res) => {
        const changes = req.body; // contains an object with new title and price
        if(req.file) {
            // checks if any file is uploaded, if true, add image property to the changes object
            changes.image = req.file.buffer.toString('base-64');
        }
        // if no image is uploaded, do nothing (keep the old image) and carry on
        try {
            await productsRepo.update(req.params.id, changes);
        } catch(err) {
            res.send('Could not find product');
        }
        // redirect the user to products list
        res.redirect('/admin/products');
    }
);

// delete a product
router.post('/admin/products/:id/delete', requireAuth, async(req, res) => {
    await productsRepo.delete(req.params.id);
    // redirect the user to products list
    res.redirect('/admin/products/');
});

module.exports = router;