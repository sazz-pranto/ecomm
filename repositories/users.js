// ***********************************************************
// UserRepository contains different methods related to a user
// ***********************************************************

const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
/* promisify takes crypto.scrypt and returns a promise based version of if
normally crypto.scrypt takes a callback in it which would be executed later
to avoid this, using promisify is a good approach */
const scrypt = util.promisify(crypto.scrypt);

const Repository = require('./repository'); // repository class


class UsersRepository extends Repository {
    // create a new user
    async create(attributes) {
        attributes.id = this.randomId() // adding id property to attributes object and assigning a randomly generated id

        const salt = crypto.randomBytes(8).toString('hex'); // generating salt for password
        const buffer = await scrypt(attributes.password, salt, 64);  // scrypt takes the password, salts it and returns the hashed version in buffer, so it needs to be converted into string
        
        const records = await this.getAll();  // get the previous list of users, since getAll() is an async method, await is used here

        /* making a new record of a user, replacing the plain password with the hashed one
        the salt is added after the period (.) sign, so that it can be separated later with split('.') */
        const newRecord = {
            ...attributes,
            password: `${buffer.toString('hex')}.${salt}`
        }
        records.push(newRecord); // push the new user to the records

        // send the records to the writeALl() method
        await this.writeAll(records);
        return newRecord;  // returning the new user's attributes along with the randomly generated id
    }

    // check if the passwords are same
    async comparePassword(savedPass, suppliedPass) {
        // savedPass -> password saved in the database (hashed.salt)
        // suppliedPass -> password given by the user while logging in

        const [hashed, salt] = savedPass.split('.'); // splitting hashed and salt and creating two variable using array destructuring
        const hashedSuppliedBuff = await scrypt(suppliedPass, salt, 64); // hashing and salting the supplied password, returns buffer
        return hashed === hashedSuppliedBuff.toString('hex'); // return true or false based on equality
    }
}

module.exports = new UsersRepository('users.json');