const pool = require('../db'); // Import database connection
const bcrypt = require('bcrypt'); // Import bcrypt for hashing and comparison

// Fetch a member by email
async function findMemberByEmail(email) {
    const query = 'SELECT * FROM members WHERE email = ?';
    const [result] = await pool.query(query, [email]);
    return result;
}

// Validate the provided password against the hashed password
async function validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

// Create a new member in the database
async function createMember(memberData) {
    const query = `
        INSERT INTO members (fname, lname, userName, email, password_hash, bio)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    return pool.query(query, [
        memberData.fname,
        memberData.lname,
        memberData.userName,
        memberData.email,
        memberData.password_hash,
        memberData.bio || null, // Set bio to null if not provided
    ]);
}

// Export all functions
module.exports = {
    findMemberByEmail,
    validatePassword,
    createMember,
};
