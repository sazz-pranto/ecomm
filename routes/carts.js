const express = require('express');

const cartsRepo = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

// receive a post request to add a product to the cart
router.post('/cart/products', async (req, res) => {
    let cart;
    // if there is no existing cart for a user, create one or get the existing cart to the corresponding user
    if(!req.session.cartId) {
        // now create a cart and add cartId to req.session
        cart = await cartsRepo.create({ items: [] }); // cart wont have any item initially so an empty array of items are added during creation of a cart
        req.session.cartId = cart.id;  // adding cartId property to the session to map the appropriate product to a cart of a specific user
    } else {
        // get the existing cart from the repository
        cart = await cartsRepo.getOne(req.session.cartId);
    }

    const existingItem = cart.items.find((item) => item.id === req.body.productId);
    /* items in cart is an array object that looks like this-
    { id: ksjfldj, quantity: 1 }, id stores the product's id that is added to the cart
    items.find will return the object that has the same id as of the productId that is
    passed when add to cart is clicked */

    // if an existing item is added, just increase the quantity of the item
    if(existingItem) {
        // increase the quantity
        existingItem.quantity++;
    } else {
        // add the new product's id to items array with quantity 1 of the cart
        cart.items.push({ id: req.body.productId, quantity: 1 });
    }

    // finally, update the cart
    await cartsRepo.update(cart.id, {
        items: cart.items
    });

    res.redirect('/cart');
});

// receive a get request to show all items in the cart
router.get('/cart', async (req, res) => {
    // if an user comes to this url who didnt add products to the cart, redirect to products list
    if(!req.session.cartId) {
        return res.redirect('/');
    }
    // if user has a cart, get it form the repository
    const cart = await cartsRepo.getOne(req.session.cartId);
    // iterate through each item that the cart has
    for(item of cart.items) {
        // item is an object like-> {id: product's Id, quantity: 1}
        // get the item that exists in cart from products repository
        const product = await productsRepo.getOne(item.id);
        // add the product to the item of the items array
        item.product = product
    }
    // send the products to the carts page after making all the changes to the items array
    res.send(cartShowTemplate({ items: cart.items }));
});

// receive a post request to delete a product to the cart
router.post('/cart/products/delete', async (req, res) => {
    const { itemId } = req.body; // destructuring id of the item to be deleted from body 
    const cart = await cartsRepo.getOne(req.session.cartId); // get the current users cart
    
    // store new items in an array after filtering(deleting)
    const remainingItems = cart.items.filter((item) => {
        return item.id !== itemId; // returns true where an item's id doesn't match the item's id to delete
    });

    // update the cart with the remaining items
    await cartsRepo.update(req.session.cartId, { items: remainingItems });
    res.redirect('/cart');
});

module.exports = router;