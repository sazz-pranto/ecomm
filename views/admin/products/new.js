// contains form to create a new product

const layout = require('../layout');
const { getEror } = require('../../helpers');

// export the html generator
module.exports = (({ errors }) => {
    return layout({
        content: `
            <form method=POST>
                <input placeholder="Title" name="title" />
                <input placeholder="Price" name="price" />
                <input type="file" name="image" />
                <button>Submit</button>
            </form>
        `
    })
});
