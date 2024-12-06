const pool = require('../db'); // Import the database connection pool

/**
 * Fetch all Lego sets from the database.
 * @returns {Promise<Array>} - A promise that resolves to a list of Lego sets.
 */
async function getAllLegoSets() {
    const query = 'SELECT * FROM sets';
    return pool.query(query);
}

/**
 * Fetch a specific Lego set by its ID.
 * @param {number} id - The ID of the Lego set.
 * @returns {Promise<Object>} - A promise that resolves to the Lego set object.
 */
async function getLegoSetById(id) {
    const query = 'SELECT * FROM sets WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result;
}

/**
 * Update the current bid for a specific Lego set.
 * @param {number} id - The ID of the Lego set.
 * @param {number} bidAmount - The new current bid amount.
 * @returns {Promise<void>} - A promise that resolves when the bid is updated.
 */
async function updateCurrentBid(id, bidAmount) {
    const query = 'UPDATE sets SET currentValue = ? WHERE id = ?';
    return pool.query(query, [bidAmount, id]);
}

/**
 * Add a new Lego set to the database.
 * @param {Object} legoSet - The Lego set details.
 * @param {number} legoSet.id - The ID of the Lego set.
 * @param {string} legoSet.name - The name of the Lego set.
 * @param {number} legoSet.year_released - The release year of the Lego set.
 * @param {number} legoSet.pieces - The number of pieces in the Lego set.
 * @param {number} legoSet.currentValue - The current bid value for the Lego set.
 * @param {number} legoSet.buy_it_now - The "Buy It Now" price for the Lego set.
 * @param {string} legoSet.images - A JSON string representing the paths to the Lego set images.
 * @returns {Promise<void>} - A promise that resolves when the Lego set is added.
 */
async function addLegoSet({ id, name, year_released, pieces, currentValue, buy_it_now, images }) {
    const query = `
        INSERT INTO sets (id, name, year_released, pieces, currentValue, buy_it_now, images)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    return pool.query(query, [id, name, year_released, pieces, currentValue, buy_it_now, images]);
}

module.exports = {
    getAllLegoSets,
    getLegoSetById,
    updateCurrentBid,
    addLegoSet, // Export the new function
};
