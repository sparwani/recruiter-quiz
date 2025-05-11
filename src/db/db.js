// src/db/db.js
// This file initializes and exports the Knex instance for database interactions.

const knex = require('knex');
const knexConfig = require('../../knexfile'); // Adjust path if knexfile is elsewhere
const environment = process.env.NODE_ENV || 'development';

module.exports = knex(knexConfig[environment]); 