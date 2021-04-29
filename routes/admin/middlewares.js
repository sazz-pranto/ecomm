/* validationResult will be an array of results(errors) after a validation check is done */
const { validationResult } = require('express-validator');

module.exports = {
/* handleErrors() is a middleware to check if there's any error for form data, if any error is found
it sends the template (form) again, if not control goes to the next step with the help of next()
handleErrors() returns a function cause middlewares have to be functions to provide to express */
    handleErrors(templateFunc, dataCallback) {
        return async (req, res, next) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                /* data will store a product object that made an error, initialized as an empty 
                object so if dataCallback is not provided we dont try to spread (in line 21) anything 
                that is undefined */
                let data = {};
                // dataCallback is only provided when anything goes wrong while editing a product
                if(dataCallback) {
                    data = await dataCallback(req);  // await is used cause this callback is defined with async
                }
                return res.send(templateFunc({ errors: errors, ...data }));  // merging whatever properties data has with errors
            }

            next();
        };
    },
    // require user to sign in to see products list or create a product
    requireAuth(req, res, next) {
        if(!req.session.userId) {
            res.redirect('/signin')
        }

        next();
    }
};
