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


class UsersRepository {
    constructor(filename) {
        if(!filename) {
            // throw error if no filename is passed while making an instance
            throw new Error('Creating a repository requires a filename');
        }
        this.filename = filename;
        try {
            /* here synchronous methods are being used inside of this constructor since 
            constructors in javascript generally does not work asynchronously */
            fs.accessSync(this.filename); // Synchronously tests a user's permissions for the file or directory specified by path(1st param).
        } catch(err) {
            // catch error if file does not exist and create a file with the given name
            fs.writeFileSync(this.filename, '[]');
        }
    }

    // get a list of all users
    async getAll() {
        // // open the file where user's data is stored
        // const contents = await fs.promises.readFile(this.filename, { encoding: 'utf-8' });

        // // read and parse its contents
        // const data = JSON.parse(contents);

        // // return the parsed data
        // return data;

        // the three process done above can also be done is a much shorter way->
        return JSON.parse(await fs.promises.readFile(this.filename, { encoding: 'utf-8' }));
    }

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

    // write to the file(here, users.json) with updated users records
    async writeAll(records) {
        // update the list of users using filename
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 4));
    }

    // generate a random ID
    randomId() {
        return crypto.randomBytes(4).toString('hex');  // randomly generates 4 bytes of data and converts it into hex string
    }

    // get one user using id
    async getOne(id) {
        const records = await this.getAll();
        return records.find((record) => record.id === id);  // find returns the element(here object) if its true (here if the id is is record object)
    }

    // delete a user using id
    async delete(id) {
        const records = await this.getAll();
        const filteredRecords = records.filter((record) => record.id !== id); // returns objects that do not have the id to be deleted
        await this.writeAll(filteredRecords); // passing the remaining records to writeAll() 
    }

    // update an user using the given id and attributes
    async update(id, attributes) {
        const records = await this.getAll();
        const record = records.find((record) => record.id === id); // find the record for the given id which should be updated

        if(!record) {
            throw new Error(`Couldn't find any records with id: ${id}`);
        }

        /* Assigning new attributes to the previous record, The Object.assign(target, source) method copies all
        enumerable own properties from one or more source objects to a target object. It returns the target object. */
        Object.assign(record, attributes);

        await this.writeAll(records); // write to the file with the updated record
    }

    // filter out a user using a filter object
    async getOneBy(filter) {
        const records = await this.getAll();
        // now iterate through all the user records array
        for(let record of records) {
            let found = true;
            // now iterate through the filter object to see if the corresponding user is in records array
            for(let key in filter) {
                // if the key or the value does not match in the filter object, assign false to found
                if(record[key] !== filter[key]) {
                    found = false;
                }
            }

            // return the record/records if found is still true(if the filter matches any of the records)
            if(found === true) {
                return record;
            }
        }
    }
}

module.exports = new UsersRepository('users.json');