// knexfile.js
// Knex.js configuration file.
// This file defines database connection settings for different environments.

// We can load the central config to reuse DB settings if we want,
// or define them separately here.
// For simplicity, and because src/config/index.js is already set up to export them,
// we can potentially use it, but knex CLI might have issues with imports from src if not careful.
// Let's define it directly using process.env for robustness with knex CLI.

require('dotenv').config(); // Ensure .env is loaded

module.exports = {
  development: {
    client: process.env.DB_CLIENT || 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/db/migrations' // Path relative to project root
    },
    seeds: {
      directory: './src/db/seeds' // Path relative to project root
    }
  },

  // Example for production (not used in V1, but good practice)
  /*
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false } // Example for Heroku or similar
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/db/migrations'
    }
  }
  */
}; 