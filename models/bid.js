const pool = require('../db'); // Import the database connection pool

// Create a new bid
async function createBid({ userID, legoSetID, bidAmount }) {
    const query = `
        INSERT INTO bids (userID, legoSetID, bidAmount)
        VALUES (?, ?, ?)
    `;
    return pool.query(query, [userID, legoSetID, bidAmount]);
}

// Fetch all bids for a specific Lego set
async function getBidsByLegoSet(legoSetID) {
    const query = 'SELECT * FROM bids WHERE legoSetID = ? ORDER BY bidAmount DESC';
    return pool.query(query, [legoSetID]);
}

module.exports = {
    createBid,
    getBidsByLegoSet,
};
