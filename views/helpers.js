module.exports = {
    
    /**********************************************************
    validationResult coming from express-validator looks like this
    /*
    Result {
        formatter: [Function: formatter],
        errors: [{
            value: 'sazzpranto96@gmail.com',
            msg: 'Email not found!',
            param: 'email',
            location: 'body' },
        {
            value: 'password',
            msg: 'Invalid password',
            param: 'password',
            location: 'body' }
        ]
    }

    results stores different object of errors in an array named errors, mapped() takes each object and makes a separate object with keys that exposes the where the 
    error occured (in email, password or password confirmation)
    like-> 
    {
        email: {
            value: 'sazzpranto96@gmail.com',
            msg: 'Email not found!',
            param: 'email',
            location: 'body'
        }
        or, 
        password: {
            value: 'password',
            msg: 'Invalid password',
            param: 'password',
            location: 'body'
        }
    }
    ***********************************************************/
    // helper function to find out the appropriate error
    getError (errors, errorType) {
        try {
            return errors.mapped()[errorType].msg;
        } catch(err) {
            return '';
        }
    }
}