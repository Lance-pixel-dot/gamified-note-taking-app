const Pool = require("pg").Pool;

const pool = new Pool({
    user: "lance",
    password: "1234",
    host: "localhost",
    port: 5432,
    database: "notes_test"
});

module.exports = pool;