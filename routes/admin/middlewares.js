/* validationResult will be an array of results(errors) after a validation check is done */
const { validationResult } = require('express-validator');

module.exports = {
/* handleErrors() is a middleware to check if there's any error for form data, if any error is found
it sends the template (form) again, if not control goes to the next step with the help of next()
handleErrors() returns a function cause middlewares have to be functions to provide to express */
    handleErrors(templateFunc) {
        return (req, res, next) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.send(templateFunc({ errors }));
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
