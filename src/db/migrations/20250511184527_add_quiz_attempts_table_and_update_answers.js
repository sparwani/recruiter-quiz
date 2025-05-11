// src/db/migrations/YYYYMMDDHHMMSS_add_quiz_attempts_table_and_update_answers.js
// Migration for creating users table, quiz_attempts table, and adding quiz_attempt_id to answers table.

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create the users table first
  await knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username', 255).notNullable().unique(); // For V1, can be a default like 'default_user'
    // Add other user fields here if needed in the future, e.g., email, password_hash
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });

  // Create the quiz_attempts table
  await knex.schema.createTable('quiz_attempts', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE'); 
    table.integer('topic_id').unsigned().notNullable();
    table.foreign('topic_id').references('id').inTable('topics').onDelete('CASCADE'); // Assuming 'topics' table exists
    table.timestamp('start_time').defaultTo(knex.fn.now());
    table.string('status').notNullable().defaultTo('in-progress'); // e.g., 'in-progress', 'completed', 'abandoned'
    table.float('final_score').nullable();
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });

  // Add quiz_attempt_id to the answers table
  await knex.schema.table('answers', function(table) {
    table.integer('quiz_attempt_id').unsigned().nullable();
    table.foreign('quiz_attempt_id').references('id').inTable('quiz_attempts').onDelete('CASCADE'); // If an attempt is deleted, its answers are deleted
  });

  // For V1, we can insert a default user if one doesn't exist, since user_id is hardcoded to 1.
  // This ensures foreign key constraints don't fail silently if user ID 1 is used before a user is created.
  // This is more of a seed operation within a migration, use with caution or handle in seeds.
  // For simplicity in V1 development, we include it here.
  const defaultUser = await knex('users').where({ id: 1 }).first();
  if (!defaultUser) {
    await knex('users').insert({ id: 1, username: 'default_user_v1' });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop in reverse order of creation to respect foreign key constraints
  
  // Remove quiz_attempt_id from the answers table
  await knex.schema.table('answers', function(table) {
    // Knex should handle dropping foreign key constraints automatically when dropping the column
    // or when the referenced table is dropped, depending on DB behavior.
    // If explicit drop is needed for your DB driver before dropping the column or parent table:
    // table.dropForeign('quiz_attempt_id'); 
    table.dropColumn('quiz_attempt_id');
  });

  // Drop the quiz_attempts table
  await knex.schema.dropTableIfExists('quiz_attempts');

  // Drop the users table
  await knex.schema.dropTableIfExists('users');
}; 
// Migration for creating users table, quiz_attempts table, and adding quiz_attempt_id to answers table.

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create the users table first
  await knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username', 255).notNullable().unique(); // For V1, can be a default like 'default_user'
    // Add other user fields here if needed in the future, e.g., email, password_hash
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });

  // Create the quiz_attempts table
  await knex.schema.createTable('quiz_attempts', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE'); 
    table.integer('topic_id').unsigned().notNullable();
    table.foreign('topic_id').references('id').inTable('topics').onDelete('CASCADE'); // Assuming 'topics' table exists
    table.timestamp('start_time').defaultTo(knex.fn.now());
    table.string('status').notNullable().defaultTo('in-progress'); // e.g., 'in-progress', 'completed', 'abandoned'
    table.float('final_score').nullable();
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });

  // Add quiz_attempt_id to the answers table
  await knex.schema.table('answers', function(table) {
    table.integer('quiz_attempt_id').unsigned().nullable();
    table.foreign('quiz_attempt_id').references('id').inTable('quiz_attempts').onDelete('CASCADE'); // If an attempt is deleted, its answers are deleted
  });

  // For V1, we can insert a default user if one doesn't exist, since user_id is hardcoded to 1.
  // This ensures foreign key constraints don't fail silently if user ID 1 is used before a user is created.
  // This is more of a seed operation within a migration, use with caution or handle in seeds.
  // For simplicity in V1 development, we include it here.
  const defaultUser = await knex('users').where({ id: 1 }).first();
  if (!defaultUser) {
    await knex('users').insert({ id: 1, username: 'default_user_v1' });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop in reverse order of creation to respect foreign key constraints
  
  // Remove quiz_attempt_id from the answers table
  await knex.schema.table('answers', function(table) {
    // Knex should handle dropping foreign key constraints automatically when dropping the column
    // or when the referenced table is dropped, depending on DB behavior.
    // If explicit drop is needed for your DB driver before dropping the column or parent table:
    // table.dropForeign('quiz_attempt_id'); 
    table.dropColumn('quiz_attempt_id');
  });

  // Drop the quiz_attempts table
  await knex.schema.dropTableIfExists('quiz_attempts');

  // Drop the users table
  await knex.schema.dropTableIfExists('users');
}; 
 
// Migration for creating users table, quiz_attempts table, and adding quiz_attempt_id to answers table.

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create the users table first
  await knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username', 255).notNullable().unique(); // For V1, can be a default like 'default_user'
    // Add other user fields here if needed in the future, e.g., email, password_hash
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });

  // Create the quiz_attempts table
  await knex.schema.createTable('quiz_attempts', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE'); 
    table.integer('topic_id').unsigned().notNullable();
    table.foreign('topic_id').references('id').inTable('topics').onDelete('CASCADE'); // Assuming 'topics' table exists
    table.timestamp('start_time').defaultTo(knex.fn.now());
    table.string('status').notNullable().defaultTo('in-progress'); // e.g., 'in-progress', 'completed', 'abandoned'
    table.float('final_score').nullable();
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });

  // Add quiz_attempt_id to the answers table
  await knex.schema.table('answers', function(table) {
    table.integer('quiz_attempt_id').unsigned().nullable();
    table.foreign('quiz_attempt_id').references('id').inTable('quiz_attempts').onDelete('CASCADE'); // If an attempt is deleted, its answers are deleted
  });

  // For V1, we can insert a default user if one doesn't exist, since user_id is hardcoded to 1.
  // This ensures foreign key constraints don't fail silently if user ID 1 is used before a user is created.
  // This is more of a seed operation within a migration, use with caution or handle in seeds.
  // For simplicity in V1 development, we include it here.
  const defaultUser = await knex('users').where({ id: 1 }).first();
  if (!defaultUser) {
    await knex('users').insert({ id: 1, username: 'default_user_v1' });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop in reverse order of creation to respect foreign key constraints
  
  // Remove quiz_attempt_id from the answers table
  await knex.schema.table('answers', function(table) {
    // Knex should handle dropping foreign key constraints automatically when dropping the column
    // or when the referenced table is dropped, depending on DB behavior.
    // If explicit drop is needed for your DB driver before dropping the column or parent table:
    // table.dropForeign('quiz_attempt_id'); 
    table.dropColumn('quiz_attempt_id');
  });

  // Drop the quiz_attempts table
  await knex.schema.dropTableIfExists('quiz_attempts');

  // Drop the users table
  await knex.schema.dropTableIfExists('users');
}; 
// Migration for creating users table, quiz_attempts table, and adding quiz_attempt_id to answers table.

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create the users table first
  await knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username', 255).notNullable().unique(); // For V1, can be a default like 'default_user'
    // Add other user fields here if needed in the future, e.g., email, password_hash
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });

  // Create the quiz_attempts table
  await knex.schema.createTable('quiz_attempts', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE'); 
    table.integer('topic_id').unsigned().notNullable();
    table.foreign('topic_id').references('id').inTable('topics').onDelete('CASCADE'); // Assuming 'topics' table exists
    table.timestamp('start_time').defaultTo(knex.fn.now());
    table.string('status').notNullable().defaultTo('in-progress'); // e.g., 'in-progress', 'completed', 'abandoned'
    table.float('final_score').nullable();
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });

  // Add quiz_attempt_id to the answers table
  await knex.schema.table('answers', function(table) {
    table.integer('quiz_attempt_id').unsigned().nullable();
    table.foreign('quiz_attempt_id').references('id').inTable('quiz_attempts').onDelete('CASCADE'); // If an attempt is deleted, its answers are deleted
  });

  // For V1, we can insert a default user if one doesn't exist, since user_id is hardcoded to 1.
  // This ensures foreign key constraints don't fail silently if user ID 1 is used before a user is created.
  // This is more of a seed operation within a migration, use with caution or handle in seeds.
  // For simplicity in V1 development, we include it here.
  const defaultUser = await knex('users').where({ id: 1 }).first();
  if (!defaultUser) {
    await knex('users').insert({ id: 1, username: 'default_user_v1' });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop in reverse order of creation to respect foreign key constraints
  
  // Remove quiz_attempt_id from the answers table
  await knex.schema.table('answers', function(table) {
    // Knex should handle dropping foreign key constraints automatically when dropping the column
    // or when the referenced table is dropped, depending on DB behavior.
    // If explicit drop is needed for your DB driver before dropping the column or parent table:
    // table.dropForeign('quiz_attempt_id'); 
    table.dropColumn('quiz_attempt_id');
  });

  // Drop the quiz_attempts table
  await knex.schema.dropTableIfExists('quiz_attempts');

  // Drop the users table
  await knex.schema.dropTableIfExists('users');
}; 
 