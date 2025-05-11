// src/db/seeds/01_initial_topics.js
// Seed file to populate the 'topics' table with initial data.

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries from the 'topics' table
  await knex('topics').del();

  // Inserts seed entries
  await knex('topics').insert([
    { name: 'Front-End' },
    { name: 'Back-End' },
    { name: 'DevOps' },
    { name: 'General Software Engineering' },
    { name: 'Databases' }
  ]);
}; 