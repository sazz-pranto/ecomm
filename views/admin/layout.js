// html scaffold/skeleton/layout for the admin end

module.exports = ({ content }) =>{
    /* this module will be called with an object that has a key named content with a string of 
    different html layout, so content is being pulled out using destructuring */
    return `
        <!DOCTYPE html>
        <html>
            <head>
            </head>
            <body>
                ${content}
            </body>
        </html>
    `;
};