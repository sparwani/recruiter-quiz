// src/services/AdminService.js
// This service handles the business logic for the admin panel.

const dbQueries = require('../db/queries');
const OpenAIService = require('./OpenAIService');

/**
 * Generates a batch of questions for a given topic and stores them with 'pending' status.
 * @param {number} topicId - The ID of the topic.
 * @param {string} topicName - The name of the topic (for OpenAI prompt).
 * @param {number} numberOfQuestions - The number of questions to generate.
 * @returns {Promise<Array<object>>} An array of the newly generated and stored (pending) questions.
 * @throws {Error} If question generation or storage fails.
 */
async function generateAndStoreQuestions(topicId, topicName, numberOfQuestions) {
  try {
    const generatedQuestions = await OpenAIService.generateQuestionsBatch(topicName, numberOfQuestions);

    if (!generatedQuestions || generatedQuestions.length === 0) {
      // If OpenAI returns nothing or an error, this might be an empty array or null
      console.warn('OpenAI did not return any questions for generation request.');
      return []; // Or throw an error, depending on desired strictness
    }

    const storedQuestionPromises = generatedQuestions.map(q => {
      const questionData = {
        topic_id: topicId,
        question_text: q.question_text,
        question_type: q.question_type,
        answer_key: q.answer_key,
        options: q.options, // This should be JSONB compatible or null
        difficulty: q.difficulty,
        // status is set to 'pending' by default in dbQueries.insertQuestion
      };
      // Validate essential fields before attempting to insert
      if (!questionData.question_text || !questionData.question_type || !questionData.answer_key) {
        console.warn('Skipping a generated question due to missing essential fields:', q);
        return null; // Skip this question
      }
      return dbQueries.insertQuestion(questionData);
    });

    const insertedResults = await Promise.all(storedQuestionPromises.filter(p => p !== null));
    
    // We might want to fetch these newly inserted questions to return them with their IDs
    // For now, let's just confirm insertion. The brief says "Returned items are shown in a pending list"
    // which implies the frontend will then fetch the /pending list.
    // However, returning the generated items directly might be useful.
    // Let's return the raw generated questions that were successfully processed and attempted to be stored.
    // The actual IDs would require another fetch or more complex return from insertQuestion.

    console.log(`${insertedResults.length} questions generated and submitted for topic ${topicName}.`);
    return generatedQuestions.filter(q => q.question_text && q.question_type && q.answer_key); // Return valid ones that were processed

  } catch (error) {
    console.error('Error in AdminService.generateAndStoreQuestions:', error);
    throw error;
  }
}

/**
 * Fetches all questions with 'pending' status.
 * @returns {Promise<Array<object>>}
 */
async function getPendingApprovalQuestions() {
  try {
    return await dbQueries.getPendingQuestions();
  } catch (error) {
    console.error('Error in AdminService.getPendingApprovalQuestions:', error);
    throw error;
  }
}

/**
 * Fetches all questions with 'approved' status.
 * @param {number | null} [topicId=null] - Optional topic ID to filter by.
 * @returns {Promise<Array<object>>}
 */
async function getListOfApprovedQuestions(topicId = null) {
  try {
    return await dbQueries.getApprovedQuestions(topicId);
  } catch (error) {
    console.error('Error in AdminService.getListOfApprovedQuestions:', error);
    throw error;
  }
}

/**
 * Fetches all questions with 'deactivated' status.
 * @param {number | null} [topicId=null] - Optional topic ID to filter by.
 * @returns {Promise<Array<object>>}
 */
async function getListOfDeactivatedQuestions(topicId = null) {
  try {
    return await dbQueries.getDeactivatedQuestions(topicId);
  } catch (error) {
    console.error('Error in AdminService.getListOfDeactivatedQuestions:', error);
    throw error;
  }
}

/**
 * Sets a question's status to 'approved'.
 * @param {number} questionId - The ID of the question to approve.
 * @returns {Promise<number>} The number of affected rows (should be 1).
 */
async function approveQuestionById(questionId) {
  try {
    const result = await dbQueries.approveQuestion(questionId);
    if (result === 0) {
      // Consider making this error message more specific if conditional logic is added in dbQueries
      throw new Error(`Question with ID ${questionId} not found or could not be approved.`);
    }
    return result;
  } catch (error) {
    console.error(`Error in AdminService.approveQuestionById for ID ${questionId}:`, error);
    throw error;
  }
}

/**
 * Sets a question's status to 'deactivated'.
 * @param {number} questionId - The ID of the question to deactivate.
 * @returns {Promise<number>} The number of affected rows (should be 1).
 */
async function deactivateQuestionById(questionId) {
  try {
    const result = await dbQueries.deactivateQuestion(questionId);
    if (result === 0) {
      // Consider making this error message more specific if conditional logic is added in dbQueries
      throw new Error(`Question with ID ${questionId} not found or could not be deactivated.`);
    }
    return result;
  } catch (error) {
    console.error(`Error in AdminService.deactivateQuestionById for ID ${questionId}:`, error);
    throw error;
  }
}

/**
 * Rejects (deletes) a question.
 * This is a hard delete irrespective of status.
 * @param {number} questionId - The ID of the question to reject.
 * @returns {Promise<number>} The number of affected rows (should be 1).
 */
async function rejectQuestionById(questionId) {
  try {
    const result = await dbQueries.rejectQuestion(questionId);
    if (result === 0) {
      throw new Error(`Question with ID ${questionId} not found.`);
    }
    return result;
  } catch (error) {
    console.error(`Error in AdminService.rejectQuestionById for ID ${questionId}:`, error);
    throw error;
  }
}

/**
 * Changes a question's status to 'pending'.
 * Can be used for questions that are currently 'approved' or 'deactivated'.
 * @param {number} questionId - The ID of the question to set to pending.
 * @returns {Promise<number>} The number of affected rows (should be 1).
 * @throws {Error} If the question is not found or the status cannot be updated.
 */
async function makeQuestionPendingById(questionId) {
  try {
    const result = await dbQueries.setQuestionStatusToPending(questionId); // New DB query function
    if (result === 0) {
      throw new Error(`Question with ID ${questionId} not found or could not be updated to pending.`);
    }
    return result;
  } catch (error) {
    console.error(`Error in AdminService.makeQuestionPendingById for ID ${questionId}:`, error);
    throw error;
  }
}

module.exports = {
  generateAndStoreQuestions,
  getPendingApprovalQuestions,
  getListOfApprovedQuestions,
  getListOfDeactivatedQuestions,
  approveQuestionById,
  deactivateQuestionById,
  rejectQuestionById,
  makeQuestionPendingById, // Export the new function
}; 