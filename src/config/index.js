// src/config/index.js
// This file loads environment variables and makes them available to the application.
// It uses the dotenv library to load variables from a .env file.

require('dotenv').config(); // Load .env file contents into process.env

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_CLIENT: process.env.DB_CLIENT || 'pg',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 5432,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_QUESTION_GENERATION_MODEL: process.env.OPENAI_QUESTION_GENERATION_MODEL || 'gpt-4-turbo-preview',
  OPENAI_GRADING_MODEL: process.env.OPENAI_GRADING_MODEL || 'gpt-3.5-turbo',

  // Knex.js connection object
  // We build this here so knexfile.js can also use it if needed,
  // or it can be constructed directly in knexfile.js from the above variables.
  database: {
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
      directory: '../db/migrations' // Relative to knexfile.js location (project root)
    },
    seeds: {
      directory: '../db/seeds' // Relative to knexfile.js location
    }
  }
}; 