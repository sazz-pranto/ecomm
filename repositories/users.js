// ***********************************************************
// UserRepository contains different methods related to a user
// ***********************************************************

const fs = require('fs');
const crypto = require('crypto');

class UserRepository {
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
        const records = await this.getAll();  // get the previous list of users, since getAll() is an async method, await is used here
        records.push(attributes);  // push the new user to the records

        // send the records to the writeALl() method
        await this.writeAll(records);
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

const test = async() => {
    const repo = new UserRepository('users.json');
    // await repo.delete('fcaf14e3');
    // await repo.create({ email: 'sazz.pranto96@gmail.com', password: '123456' });
    // await repo.update('a1dfffsa9bda1', { email: "sazthossain@gmail.com", password: '1234' });
    // const users = await repo.getAll();
    const users = await repo.getOneBy( { email: "sazz.pranto96@gmail.com" });
    console.log(users);
};

test();