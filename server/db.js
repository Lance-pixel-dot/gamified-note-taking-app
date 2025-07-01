const Pool = require("pg").Pool;

const pool = new Pool({
    user: "lance",
    password: "lance1248",
    host: "localhost",
    port: 5432,
    database: "notes_test"
});

module.exports = pool;