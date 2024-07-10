const pool = require('../config/db');

const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      userId SERIAL PRIMARY KEY,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(255)
    );
  `;
  await pool.query(query);
};

const addUser = async (user) => {
  const query = `
    INSERT INTO users (firstName, lastName, email, password, phone)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [user.firstName, user.lastName, user.email, user.password, user.phone];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1;';
  const { rows } = await pool.query(query, [email]);
  return rows[0];
};

const  findUserById =   async (userId) => {
  const queryText = 'SELECT * FROM users WHERE userId = $1';
  const { rows } = await pool.query(queryText, [userId]);
  return rows[0];
};


const clearUsers = async () => {
  await pool.query('DELETE FROM user_organisations'); // Clear user_organisations first
  await pool.query('DELETE FROM users');
};





module.exports = {
  createUserTable,
  addUser,
  findUserByEmail,
  findUserById,
  clearUsers
};
