/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('quiz_attempts', function(table) {
    table.integer('current_question_index').unsigned().notNullable().defaultTo(0);
    table.float('current_score').notNullable().defaultTo(0);
    table.timestamp('last_activity_time').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('quiz_attempts', function(table) {
    table.dropColumn('current_question_index');
    table.dropColumn('current_score');
    table.dropColumn('last_activity_time');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('quiz_attempts', function(table) {
    table.dropColumn('current_question_index');
    table.dropColumn('current_score');
    table.dropColumn('last_activity_time');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('quiz_attempts', function(table) {
    table.dropColumn('current_question_index');
    table.dropColumn('current_score');
    table.dropColumn('last_activity_time');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('quiz_attempts', function(table) {
    table.dropColumn('current_question_index');
    table.dropColumn('current_score');
    table.dropColumn('last_activity_time');
  });
};
