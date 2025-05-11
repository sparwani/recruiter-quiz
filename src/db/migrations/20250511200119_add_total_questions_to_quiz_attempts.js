// src/db/migrations/20250511200119_add_total_questions_to_quiz_attempts.js
// Adds the total_questions_in_attempt column to the quiz_attempts table.

exports.up = function(knex) {
  return knex.schema.table('quiz_attempts', function(table) {
    table.integer('total_questions_in_attempt').unsigned().nullable().comment('The total number of questions that were part of this quiz topic when the attempt started.');
  });
};

exports.down = function(knex) {
  return knex.schema.table('quiz_attempts', function(table) {
    table.dropColumn('total_questions_in_attempt');
  });
}; 
// Adds the total_questions_in_attempt column to the quiz_attempts table.

exports.up = function(knex) {
  return knex.schema.table('quiz_attempts', function(table) {
    table.integer('total_questions_in_attempt').unsigned().nullable().comment('The total number of questions that were part of this quiz topic when the attempt started.');
  });
};

exports.down = function(knex) {
  return knex.schema.table('quiz_attempts', function(table) {
    table.dropColumn('total_questions_in_attempt');
  });
}; 
 
// Adds the total_questions_in_attempt column to the quiz_attempts table.

exports.up = function(knex) {
  return knex.schema.table('quiz_attempts', function(table) {
    table.integer('total_questions_in_attempt').unsigned().nullable().comment('The total number of questions that were part of this quiz topic when the attempt started.');
  });
};

exports.down = function(knex) {
  return knex.schema.table('quiz_attempts', function(table) {
    table.dropColumn('total_questions_in_attempt');
  });
}; 
// Adds the total_questions_in_attempt column to the quiz_attempts table.

exports.up = function(knex) {
  return knex.schema.table('quiz_attempts', function(table) {
    table.integer('total_questions_in_attempt').unsigned().nullable().comment('The total number of questions that were part of this quiz topic when the attempt started.');
  });
};

exports.down = function(knex) {
  return knex.schema.table('quiz_attempts', function(table) {
    table.dropColumn('total_questions_in_attempt');
  });
}; 
 