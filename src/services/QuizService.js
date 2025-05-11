// src/services/QuizService.js
// This service handles the business logic for the quiz flow.

const dbQueries = require('../db/queries');
const OpenAIService = require('./OpenAIService');

/**
 * Fetches all quiz topics.
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
async function getTopics() {
  try {
    return await dbQueries.getAllTopics();
  } catch (error) {
    console.error('Error in QuizService.getTopics:', error);
    throw error; // Re-throw to be handled by the route handler
  }
}

/**
 * Gets all available questions for a given topic and user.
 * It fetches questions that haven't been answered by the user in the last 24 hours.
 * @param {number} topicId - The ID of the topic.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array<Object> | null>} An array of question objects or null if no questions are available.
 */
async function getQuizQuestions(topicId, userId) {
  try {
    // userId is now passed as a parameter
    const availableQuestions = await dbQueries.getQuestionsByTopic(topicId, userId);

    if (!availableQuestions || availableQuestions.length === 0) {
      return null; // No questions available for this topic that meet the criteria
    }

    // Return all available questions instead of a random one
    return availableQuestions;
  } catch (error) {
    console.error('Error in QuizService.getQuizQuestions:', error);
    throw error;
  }
}

/**
 * Submits an answer for a question and returns the grading result.
 * Also records the answer against a quiz attempt and updates the attempt's progress.
 * @param {object} params - Parameters for submitting an answer.
 * @param {object} params.submissionDetails - Details of the submission.
 * @param {number} params.submissionDetails.questionId - The ID of the question.
 * @param {string} params.submissionDetails.questionText - The full text of the question.
 * @param {string} params.submissionDetails.questionType - Type of question ('free-text' or 'multiple-choice').
 * @param {string} params.submissionDetails.userAnswer - The user's submitted answer.
 * @param {string} [params.submissionDetails.mcqAnswerKey] - The correct answer key for MCQ.
 * @param {number} params.userId - The ID of the user.
 * @param {number} params.quizAttemptId - The ID of the current quiz attempt.
 * @param {number} params.answeredQuestionIndex - The 0-based index of the question just answered.
 * @param {number} params.currentTotalScoreBeforeThisAnswer - The total score for the attempt before this answer.
 * @returns {Promise<object>} The grading result for the current answer including score, feedback, and suggested answer.
 */
async function submitAnswer({
  submissionDetails,
  userId,
  quizAttemptId,
  answeredQuestionIndex,
  currentTotalScoreBeforeThisAnswer,
}) {
  try {
    const { questionId, questionText, questionType, userAnswer, mcqAnswerKey } = submissionDetails;

    let scoreForThisAnswer = 0;
    let feedback = '';
    let suggestedAnswer = '';

    if (questionType === 'free-text') {
      const gradingResult = await OpenAIService.gradeFreeTextAnswer(questionText, userAnswer);
      if (gradingResult) {
        scoreForThisAnswer = gradingResult.score;
        feedback = gradingResult.feedback;
        suggestedAnswer = gradingResult.suggestedAnswer;
      } else {
        scoreForThisAnswer = 0;
        feedback = 'Could not grade the answer at this time. Please try again later.';
        suggestedAnswer = 'N/A';
      }
    } else if (questionType === 'multiple-choice') {
      if (!mcqAnswerKey) {
        console.error('MCQ answer key is missing for questionId:', questionId);
        throw new Error('Multiple choice question submitted without an answer key for grading.');
      }
      if (userAnswer === mcqAnswerKey) {
        scoreForThisAnswer = 5; // Max score for correct MCQ
        feedback = 'Correct!';
      } else {
        scoreForThisAnswer = 0; // Min score for incorrect MCQ
        feedback = `Incorrect. The correct answer was ${mcqAnswerKey}.`;
      }
      suggestedAnswer = `The correct option was ${mcqAnswerKey}.`;
    } else {
      throw new Error(`Unsupported question type: ${questionType}`);
    }

    const answerRecord = {
      user_id: userId,
      question_id: questionId,
      quiz_attempt_id: quizAttemptId,
      user_answer: userAnswer,
      score: scoreForThisAnswer,
      feedback,
      suggested_answer: suggestedAnswer,
      timestamp: new Date(),
    };

    await dbQueries.storeAnswer(answerRecord);

    // Update quiz attempt progress
    const newOverallScore = currentTotalScoreBeforeThisAnswer + scoreForThisAnswer;
    const nextQuestionIndex = answeredQuestionIndex + 1;

    await dbQueries.updateQuizAttemptProgress({
      quizAttemptId,
      currentQuestionIndex: nextQuestionIndex,
      newCurrentScore: newOverallScore,
    });

    return { score: scoreForThisAnswer, feedback, suggestedAnswer };
  } catch (error) {
    console.error('Error in QuizService.submitAnswer:', error);
    throw error;
  }
}

/**
 * Starts a new quiz attempt for a given user and topic.
 * @param {number} userId - The ID of the user.
 * @param {number} topicId - The ID of the topic.
 * @returns {Promise<number>} The ID of the newly created quiz attempt.
 * @throws {Error} If the database query fails or no ID is returned.
 */
async function startQuizAttempt(userId, topicId) {
  try {
    // dbQueries.startNewQuizAttempt now returns an object like { id: newAttemptId, total_questions_in_attempt: count }
    const attemptDetails = await dbQueries.startNewQuizAttempt(userId, topicId);

    if (!attemptDetails || attemptDetails.id === undefined || attemptDetails.total_questions_in_attempt === undefined) {
      console.error('Failed to create quiz attempt or retrieve its full details.', { userId, topicId, attemptDetails });
      throw new Error('Failed to start quiz attempt: Essential details not returned.');
    }

    // Return the structured object
    return {
      quizAttemptId: attemptDetails.id,
      totalQuestionsInAttempt: attemptDetails.total_questions_in_attempt,
    };
  } catch (error) {
    console.error('Error in QuizService.startQuizAttempt:', error);
    // Ensure the original error isn't lost if it's not the one we threw
    if (!error.message.startsWith('Failed to start quiz attempt')) {
        throw new Error(`Failed to start quiz attempt: ${error.message}`);
    }
    throw error; // Re-throw to be handled by the route handler
  }
}

/**
 * Fetches an active quiz attempt for a user and topic.
 * @param {number} userId - The ID of the user.
 * @param {number} topicId - The ID of the topic.
 * @returns {Promise<object|undefined>} The active quiz attempt details or undefined if not found.
 */
async function getUserActiveQuizAttempt(userId, topicId) {
  try {
    return await dbQueries.getActiveQuizAttempt(userId, topicId);
  } catch (error) {
    console.error(`Error in QuizService.getUserActiveQuizAttempt for userId ${userId}, topicId ${topicId}:`, error);
    throw error; // Re-throw to be handled by the route handler
  }
}

module.exports = {
  getTopics,
  getQuizQuestions,
  submitAnswer,
  startQuizAttempt,
  getUserActiveQuizAttempt,
}; 