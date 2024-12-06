const mariadb = require('mariadb'); // Import MariaDB library

// Create a connection pool
const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost', // Database host
    user: process.env.DB_USER || 'root', // Database username
    password: process.env.DB_PASS || 'sule', // Database password
    database: process.env.DB_NAME || 'lnib', // Database name
    connectionLimit: 5, // Maximum number of simultaneous connections
});

// Export the connection pool
module.exports = pool;
