// src/db/migrations/20240716000000_add_status_to_questions.js
// Migration to replace the 'approved' boolean column with a 'status' string column (pending, approved, deactivated).

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('questions', function(table) {
    // Add the new status column, defaulting to 'pending'
    // It will store 'pending', 'approved', or 'deactivated'
    table.string('status', 20).notNullable().defaultTo('pending');
  });

  // Migrate existing data from 'approved' to 'status'
  // Set status to 'approved' where approved = true
  await knex('questions')
    .where('approved', true)
    .update({ status: 'approved' });

  // For rows where approved = false, they will already have status = 'pending' due to the default.
  // If there was a need to distinguish them further, more specific logic would be needed here.
  // For this migration, approved = false maps to status = 'pending'.

  await knex.schema.alterTable('questions', function(table) {
    // Drop the old 'approved' column
    table.dropColumn('approved');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('questions', function(table) {
    // Add the 'approved' column back
    table.boolean('approved').defaultTo(false);
  });

  // Migrate existing data from 'status' back to 'approved'
  await knex('questions')
    .where('status', 'approved')
    .update({ approved: true });
  
  // For 'pending' or 'deactivated', approved will be false
  await knex('questions')
    .whereIn('status', ['pending', 'deactivated'])
    .update({ approved: false });

  await knex.schema.alterTable('questions', function(table) {
    // Drop the 'status' column
    table.dropColumn('status');
  });
}; 