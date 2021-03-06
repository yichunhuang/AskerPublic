require('dotenv').config();
const knex = require('knex')({
    client: 'mysql',
    connection: {
        host                : process.env["DB_HOST"],
        user                : process.env["DB_USER"],
        password            : process.env["DB_PASSWORD"],
        database            : process.env["DB_DATABASE"],
        charset             : 'utf8'
    },
    pool: {
        max: 100,
        min: 0
     }
});
const bookshelf = require('bookshelf')(knex);
bookshelf.plugin(require('bookshelf-eloquent'));
module.exports = bookshelf;