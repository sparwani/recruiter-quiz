// src/db/queries.js
// This file contains functions for interacting with the database using Knex.

const db = require('./db'); // Knex instance

// Fetch all topics
async function getAllTopics() {
  return db('topics').select('id', 'name');
}

// Fetch questions for a topic, excluding those answered by a user in the last 24 hours
async function getQuestionsByTopic(topicId, userId = 1) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Subquery to find questions answered by the user for the given topic in the last 24 hours
  const answeredQuestionIdsSubQuery = db('answers')
    .select('question_id')
    .join('questions', 'answers.question_id', 'questions.id')
    .where('answers.user_id', userId)
    .andWhere('questions.topic_id', topicId)
    .andWhere('answers.timestamp', '>=', twentyFourHoursAgo);

  return db('questions')
    .where('topic_id', topicId)
    .where('status', 'approved') // Only fetch approved questions
    .whereNotIn('id', answeredQuestionIdsSubQuery)
    .select('id', 'question_text', 'question_type', 'options', 'answer_key', 'difficulty'); // Include all necessary fields
}

// Store an answer
async function storeAnswer(answerDetails) {
  // answerDetails should be an object like:
  // { user_id, question_id, quiz_attempt_id, user_answer, score, feedback, suggested_answer }
  return db('answers').insert({
    user_id: answerDetails.user_id,
    question_id: answerDetails.question_id,
    quiz_attempt_id: answerDetails.quiz_attempt_id,
    user_answer: answerDetails.user_answer,
    score: answerDetails.score,
    feedback: answerDetails.feedback,
    suggested_answer: answerDetails.suggested_answer,
    timestamp: answerDetails.timestamp || db.fn.now() // Ensure timestamp is set
  }).returning('id');
}

// --- Admin Flow Database Queries ---

/**
 * Inserts a new question into the database, initially with 'pending' status.
 * @param {object} questionData - Data for the new question.
 * @param {number} questionData.topic_id - The ID of the topic.
 * @param {string} questionData.question_text - The text of the question.
 * @param {string} questionData.question_type - Type ('free-text', 'multiple-choice').
 * @param {string} [questionData.answer_key] - Model answer or MCQ correct option.
 * @param {object} [questionData.options] - MCQ options (JSONB).
 * @param {string} [questionData.difficulty] - Difficulty level.
 * @returns {Promise<number[]>} Array containing the ID of the newly inserted question.
 */
async function insertQuestion(questionData) {
  return db('questions').insert({
    ...questionData,
    status: 'pending', // Always insert with 'pending' status initially
  }).returning('id');
}

/**
 * Fetches all pending questions (status = 'pending'), joining with topic names.
 * @returns {Promise<Array<object>>}
 */
async function getPendingQuestions() {
  return db('questions')
    .join('topics', 'questions.topic_id', 'topics.id')
    .where('questions.status', 'pending')
    .select(
      'questions.id',
      'questions.question_text',
      'questions.question_type',
      'questions.answer_key',
      'questions.options',
      'questions.difficulty',
      'topics.name as topic_name' // Include topic name
    );
}

/**
 * Fetches all approved questions (status = 'approved'), joining with topic names.
 * @param {number | null} [topicId=null] - Optional topic ID to filter by.
 * @returns {Promise<Array<object>>}
 */
async function getApprovedQuestions(topicId = null) {
  let query = db('questions')
    .join('topics', 'questions.topic_id', 'topics.id')
    .where('questions.status', 'approved');

  if (topicId) {
    query = query.where('questions.topic_id', topicId);
  }

  return query.select(
    'questions.id',
    'questions.topic_id',
    'questions.question_text',
    'questions.question_type',
    'questions.answer_key',
    'questions.options',
    'questions.difficulty',
    'topics.name as topic_name'
  );
}

/**
 * Fetches all deactivated questions (status = 'deactivated'), joining with topic names.
 * @param {number | null} [topicId=null] - Optional topic ID to filter by.
 * @returns {Promise<Array<object>>}
 */
async function getDeactivatedQuestions(topicId = null) {
  let query = db('questions')
    .join('topics', 'questions.topic_id', 'topics.id')
    .where('questions.status', 'deactivated');

  if (topicId) {
    query = query.where('questions.topic_id', topicId);
  }

  return query.select(
    'questions.id',
    'questions.topic_id', // Include topic_id for consistency or potential filtering
    'questions.question_text',
    'questions.question_type',
    'questions.answer_key',
    'questions.options',
    'questions.difficulty',
    'topics.name as topic_name'
  );
}

/**
 * Sets a question's status to 'approved' by its ID.
 * Can approve a question if its current status is 'pending' or 'deactivated'.
 * @param {number} questionId - The ID of the question to approve.
 * @returns {Promise<number>} The number of rows updated (should be 1 if successful).
 */
async function approveQuestion(questionId) {
  return db('questions')
    .where('id', questionId)
    // .whereIn('status', ['pending', 'deactivated']) // Optional: make approval conditional
    .update({ status: 'approved' });
}

/**
 * Sets a question's status to 'deactivated' by its ID.
 * Typically used for questions that are currently 'approved'.
 * @param {number} questionId - The ID of the question to deactivate.
 * @returns {Promise<number>} The number of rows updated (should be 1 if successful).
 */
async function deactivateQuestion(questionId) {
  return db('questions')
    .where('id', questionId)
    // .where('status', 'approved') // Optional: make deactivation conditional
    .update({ status: 'deactivated' });
}

/**
 * Rejects (deletes) a question by its ID.
 * This is a hard delete and does not consider status.
 * @param {number} questionId - The ID of the question to reject.
 * @returns {Promise<number>} The number of rows deleted (should be 1 if successful).
 */
async function rejectQuestion(questionId) {
  return db('questions').where('id', questionId).del();
}

/**
 * Sets a question's status to 'pending' by its ID.
 * Can be used for questions that are currently 'approved' or 'deactivated'.
 * @param {number} questionId - The ID of the question to update.
 * @returns {Promise<number>} The number of rows updated (should be 1 if successful).
 */
async function setQuestionStatusToPending(questionId) {
  return db('questions')
    .where('id', questionId)
    // Optionally, could add .whereIn('status', ['approved', 'deactivated']) to make it conditional
    .update({ status: 'pending' });
}

// --- Quiz Flow Database Queries ---

/**
 * Creates a new quiz attempt record.
 * @param {number} userId - The ID of the user starting the attempt.
 * @param {number} topicId - The ID of the topic for the attempt.
 * @returns {Promise<number[]>} An array containing the ID of the newly created quiz attempt.
 */
async function startNewQuizAttempt(userId, topicId) {
  console.log(`[DB Query] startNewQuizAttempt called for userId: ${userId}, topicId: ${topicId}`);
  
  // First, count active (approved) questions for this topic
  let countResult;
  try {
    countResult = await db('questions')
      .where({ topic_id: topicId, status: 'approved' }) // Assuming 'approved' questions are the ones included in a quiz
      .count('* as totalActiveQuestions')
      .first();
    console.log(`[DB Query] Count query result for topicId ${topicId}:`, countResult);
  } catch (error) {
    console.error(`[DB Query] Error counting active questions for topicId ${topicId}:`, error);
    throw new Error(`Database error while counting questions: ${error.message}`);
  }

  if (!countResult) {
    console.error(`[DB Query] countResult is null or undefined for topicId ${topicId}. Defaulting totalQuestions to 0.`);
    // This case indicates an issue with the count query or DB connection if it happens consistently.
  }

  const totalQuestions = countResult && countResult.totalActiveQuestions !== undefined 
    ? parseInt(countResult.totalActiveQuestions, 10) 
    : 0;
  console.log(`[DB Query] Parsed totalQuestions for topicId ${topicId}: ${totalQuestions}`);

  // Then, insert the new quiz attempt with this count
  let newAttempt;
  try {
    newAttempt = await db('quiz_attempts').insert({
      user_id: userId,
      topic_id: topicId,
      total_questions_in_attempt: totalQuestions, // Ensure this is being set correctly
      // status and start_time will use defaults defined in the table schema
    }).returning(['id', 'total_questions_in_attempt']); // Return both id and the count
    console.log(`[DB Query] Insert result for new attempt (topicId ${topicId}):`, newAttempt);
  } catch (error) {
    console.error(`[DB Query] Error inserting new quiz attempt for topicId ${topicId} with totalQuestions ${totalQuestions}:`, error);
    throw new Error(`Database error while inserting quiz attempt: ${error.message}`);
  }

  if (newAttempt && newAttempt.length > 0 && newAttempt[0].id !== undefined && newAttempt[0].total_questions_in_attempt !== undefined) {
    console.log(`[DB Query] Successfully created attempt ${newAttempt[0].id} with total_questions_in_attempt: ${newAttempt[0].total_questions_in_attempt}`);
    return { 
      id: newAttempt[0].id, 
      total_questions_in_attempt: newAttempt[0].total_questions_in_attempt 
    };
  } else {
    console.error('[DB Query] Failed to create new quiz attempt or retrieve its full details. Insert result was:', newAttempt);
    throw new Error('Failed to create new quiz attempt or retrieve its details after insert.');
  }
}

/**
 * Updates the progress of a quiz attempt.
 * @param {object} progressData - Data for updating the attempt.
 * @param {number} progressData.quizAttemptId - The ID of the quiz attempt to update.
 * @param {number} progressData.currentQuestionIndex - The new current question index.
 * @param {number} progressData.newCurrentScore - The new total score for the attempt.
 * @returns {Promise<number>} The number of rows updated (should be 1).
 */
async function updateQuizAttemptProgress({ quizAttemptId, currentQuestionIndex, newCurrentScore }) {
  return db('quiz_attempts')
    .where({ id: quizAttemptId })
    .update({
      current_question_index: currentQuestionIndex,
      current_score: newCurrentScore,
      last_activity_time: db.fn.now(),
    });
}

/**
 * Fetches an active (status = 'in-progress') quiz attempt for a given user and topic.
 * @param {number} userId - The ID of the user.
 * @param {number} topicId - The ID of the topic.
 * @returns {Promise<object|undefined>} The active quiz attempt object or undefined if not found.
 * The object includes id, current_question_index, current_score, status.
 */
async function getActiveQuizAttempt(userId, topicId) {
  return db('quiz_attempts')
    .where({
      user_id: userId,
      topic_id: topicId,
      status: 'in-progress',
    })
    .select(
      'id as quizAttemptId', 
      'current_question_index',
      'current_score',
      'status',
      'total_questions_in_attempt as totalQuestionsInAttempt'
    )
    .orderBy([
      { column: 'start_time', order: 'desc' }, 
      { column: 'id', order: 'desc' } // Secondary sort for stability
    ])
    .first();
}

module.exports = {
  getAllTopics,
  getQuestionsByTopic,
  storeAnswer,
  startNewQuizAttempt,
  updateQuizAttemptProgress,
  getActiveQuizAttempt,
  insertQuestion,
  getPendingQuestions,
  getApprovedQuestions,
  getDeactivatedQuestions,
  approveQuestion,
  deactivateQuestion,
  rejectQuestion,
  setQuestionStatusToPending,
}; 