const express = require('express');

const ProductsRepository = require('../../repositories/products');  // products class
const productsNewTemplate = require('../../views/admin/products/new'); // template for adding new product
const { validationResult } = require('express-validator');

const { requireTitle, requirePrice } = require('./validators');

const router = express.Router();

// products
router.get('/admin/products', (req, res) => {

});

// new product creation form
router.get('/admin/products/new', (req, res) => {
    res.send(productsNewTemplate({}));
});

// handle form submission for a new product
router.post('/admin/products/new',
    [requireTitle, requirePrice], // validation checks
    (req, res) => {
        const errors = validationResult(req);
        console.log(errors);
        res.send('Submitted');
});

module.exports = router;