// src/db/migrations/20240710000000_create_initial_tables.js
// Migration to create the initial tables: topics, questions, and answers.

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('topics', function(table) {
      table.increments('id').primary();
      table.string('name', 255).notNullable().unique();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('questions', function(table) {
      table.increments('id').primary();
      table.integer('topic_id').unsigned().references('id').inTable('topics').onDelete('CASCADE');
      table.text('question_text').notNullable();
      table.string('question_type', 50).notNullable().defaultTo('free-text'); // e.g., 'free-text', 'multiple-choice'
      table.text('answer_key').nullable(); // Model answer for free-text, or correct option identifier for MCQ
      table.jsonb('options').nullable(); // For MCQ: e.g., {"A": "Option A", "B": "Option B"}
      table.string('difficulty', 50).nullable(); // e.g., 'easy', 'medium', 'hard'
      table.boolean('approved').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('answers', function(table) {
      table.increments('id').primary();
      table.integer('user_id').notNullable(); // Will be hardcoded to 1 for V1
      table.integer('question_id').unsigned().references('id').inTable('questions').onDelete('CASCADE');
      table.text('user_answer').nullable();
      table.integer('score').nullable(); // e.g., 0-5
      table.text('feedback').nullable();
      table.text('suggested_answer').nullable();
      table.timestamp('timestamp').defaultTo(knex.fn.now());
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('answers')
    .dropTableIfExists('questions')
    .dropTableIfExists('topics');
}; 