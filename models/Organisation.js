const pool = require('../config/db');

const createOrgTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS organisations (
      orgId SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT
    );
  `;
  await pool.query(query);
};

const addOrganisation = async (org) => {
  const query = `
    INSERT INTO organisations (name, description)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [org.name, org.description];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const findOrgById = async (orgId) => {
  const query = 'SELECT * FROM organisations WHERE orgId = $1;';
  const { rows } = await pool.query(query, [orgId]);
  return rows[0];
};

const findOrgsByUserId = async (userId) => {
  const query = `
    SELECT o.*
    FROM organisations o
    JOIN user_organisations uo ON o.orgId = uo.orgId
    WHERE uo.userId = $1;
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

const createUserOrgTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_organisations (
      userId INT NOT NULL,
      orgId INT NOT NULL,
      PRIMARY KEY (userId, orgId),
      FOREIGN KEY (userId) REFERENCES users(userId),
      FOREIGN KEY (orgId) REFERENCES organisations(orgId)
    );
  `;
  await pool.query(query);
};

const addUserToOrg = async (userId, orgId) => {
  const query = `
    INSERT INTO user_organisations (userId, orgId)
    VALUES ($1, $2);
  `;
  const values = [userId, orgId];
  const { rows } = await pool.query(query, values);
  return rows[0];
  
  // await pool.query(query, [userId, orgId]);
};

const clearOrganisations = async () => {
  await pool.query('DELETE FROM organisations');
};


module.exports = {
  createOrgTable,
  addOrganisation,
  findOrgById,
  findOrgsByUserId,
  createUserOrgTable,
  addUserToOrg,
  clearOrganisations
};
