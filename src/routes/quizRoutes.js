// src/routes/quizRoutes.js
// Defines the API routes for the quiz functionality.

const express = require('express');
const QuizService = require('../services/QuizService');

const router = express.Router();

// GET /api/topics - Fetches all quiz topics
// This is effectively GET /topics when mounted under /api
router.get('/topics', async (req, res, next) => {
  try {
    const topics = await QuizService.getTopics();
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    next(error); // Pass to global error handler
  }
});

// POST /api/quiz/start - Starts a new quiz attempt
// This is effectively POST /quiz/start when mounted under /api
router.post('/quiz/start', async (req, res, next) => {
  try {
    const { userId, topicId } = req.body;

    // Basic validation
    if (userId === undefined || topicId === undefined) {
      return res.status(400).json({ error: 'Missing userId or topicId in request body.' });
    }
    const parsedUserId = parseInt(userId, 10);
    const parsedTopicId = parseInt(topicId, 10);

    if (isNaN(parsedUserId) || isNaN(parsedTopicId)) {
      return res.status(400).json({ error: 'Invalid userId or topicId. Both must be numbers.' });
    }

    // QuizService.startQuizAttempt now returns an object: { quizAttemptId, totalQuestionsInAttempt }
    const attemptDetails = await QuizService.startQuizAttempt(parsedUserId, parsedTopicId);
    
    // Send the whole object back to the client
    res.status(201).json(attemptDetails); // 201 Created status
  } catch (error) {
    console.error(`Error starting quiz attempt for user ${req.body.userId}, topic ${req.body.topicId}:`, error);
    // Check for specific errors from service
    if (error.message.includes('Failed to start quiz attempt')) {
        return res.status(500).json({ error: 'Could not start quiz attempt on the server.' });
    }
    next(error);
  }
});

// GET /api/quiz/:topicId/questions - Fetches all available questions for a quiz session
// This is effectively GET /quiz/:topicId/questions when mounted under /api
router.get('/quiz/:topicId/questions', async (req, res, next) => {
  try {
    const topicId = parseInt(req.params.topicId, 10);
    const userId = req.query.userId ? parseInt(req.query.userId, 10) : 1; // Default to userId 1 if not provided

    if (isNaN(topicId)) {
      return res.status(400).json({ error: 'Invalid topic ID' });
    }
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const questions = await QuizService.getQuizQuestions(topicId, userId);

    if (!questions || questions.length === 0) {
      // Send an empty array if no questions are found, frontend handles this message
      return res.json([]); 
    }
    res.json(questions);
  } catch (error) {
    console.error(`Error fetching quiz questions for topic ${req.params.topicId}, user ${req.query.userId}:`, error);
    next(error);
  }
});

// GET /api/questions/:topicId/next - Fetches the next question for a topic (OLD - consider for removal or refactor if unused)
// This is effectively GET /questions/:topicId/next when mounted under /api
router.get('/questions/:topicId/next', async (req, res, next) => {
  try {
    const topicId = parseInt(req.params.topicId, 10);
    if (isNaN(topicId)) {
      return res.status(400).json({ error: 'Invalid topic ID' });
    }
    const question = await QuizService.getNextQuestion(topicId);
    if (!question) {
      return res.status(404).json({ message: 'No more questions available for this topic at the moment.' });
    }
    res.json(question);
  } catch (error) {
    console.error(`Error fetching next question for topic ${req.params.topicId}:`, error);
    next(error);
  }
});

// POST /api/answers - Submits an answer and gets it graded, also updates quiz attempt progress
router.post('/answers', async (req, res, next) => {
  try {
    // Extract all necessary fields from the request body
    const {
      questionId,
      questionText,
      questionType,
      userAnswer,
      mcqAnswerKey,
      userId, // New: For associating answer and progress
      quizAttemptId, // New: For identifying the quiz attempt
      answeredQuestionIndex, // New: 0-based index of the question being answered
      currentTotalScoreBeforeThisAnswer, // New: Current total score before this answer
    } = req.body;

    // --- Basic validation for original fields ---
    if (questionId === undefined || !questionText || !questionType || userAnswer === undefined) {
      return res.status(400).json({ error: 'Missing required fields for answer submission (questionId, questionText, questionType, userAnswer).' });
    }
    if (questionType === 'multiple-choice' && mcqAnswerKey === undefined) {
      return res.status(400).json({ error: 'mcqAnswerKey is required for multiple-choice questions.' });
    }

    // --- Basic validation for new fields ---
    if (
      userId === undefined ||
      quizAttemptId === undefined ||
      answeredQuestionIndex === undefined ||
      currentTotalScoreBeforeThisAnswer === undefined
    ) {
      return res.status(400).json({
        error:
          'Missing required fields for quiz progress (userId, quizAttemptId, answeredQuestionIndex, currentTotalScoreBeforeThisAnswer).'
      });
    }

    // --- Parse numeric fields ---
    const parsedQuestionId = parseInt(questionId, 10);
    const parsedUserId = parseInt(userId, 10);
    const parsedQuizAttemptId = parseInt(quizAttemptId, 10);
    const parsedAnsweredQuestionIndex = parseInt(answeredQuestionIndex, 10);
    const parsedCurrentTotalScoreBeforeThisAnswer = parseInt(currentTotalScoreBeforeThisAnswer, 10);

    if (isNaN(parsedQuestionId) || isNaN(parsedUserId) || isNaN(parsedQuizAttemptId) || isNaN(parsedAnsweredQuestionIndex) || isNaN(parsedCurrentTotalScoreBeforeThisAnswer)) {
      return res.status(400).json({ error: 'One or more numeric fields are invalid.' });
    }
    if (parsedAnsweredQuestionIndex < 0) {
      return res.status(400).json({ error: 'answeredQuestionIndex must be non-negative.'});
    }
     if (parsedCurrentTotalScoreBeforeThisAnswer < 0) {
      return res.status(400).json({ error: 'currentTotalScoreBeforeThisAnswer must be non-negative.'});
    }

    const submissionDetails = {
      questionId: parsedQuestionId,
      questionText,
      questionType,
      userAnswer,
      mcqAnswerKey, // Will be undefined if not provided, handled by service
    };

    // Call the updated service function with all required parameters
    const result = await QuizService.submitAnswer({
      submissionDetails,
      userId: parsedUserId,
      quizAttemptId: parsedQuizAttemptId,
      answeredQuestionIndex: parsedAnsweredQuestionIndex,
      currentTotalScoreBeforeThisAnswer: parsedCurrentTotalScoreBeforeThisAnswer,
    });

    res.json(result); // Returns { score: scoreForThisAnswer, feedback, suggestedAnswer }
  } catch (error) {
    console.error('Error submitting answer:', error);
    if (
      error.message.includes('Unsupported question type') ||
      error.message.includes('Multiple choice question submitted without an answer key')
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// GET /api/quiz/attempts/active - Fetches an active quiz attempt for a user and topic
router.get('/quiz/attempts/active', async (req, res, next) => {
  try {
    const { userId, topicId } = req.query;

    if (userId === undefined || topicId === undefined) {
      return res.status(400).json({ error: 'Missing userId or topicId in query parameters.' });
    }

    const parsedUserId = parseInt(userId, 10);
    const parsedTopicId = parseInt(topicId, 10);

    if (isNaN(parsedUserId) || isNaN(parsedTopicId)) {
      return res.status(400).json({ error: 'Invalid userId or topicId. Both must be numbers.' });
    }

    const activeAttempt = await QuizService.getUserActiveQuizAttempt(parsedUserId, parsedTopicId);

    if (activeAttempt) {
      res.json(activeAttempt);
    } else {
      res.status(404).json({ message: 'No active quiz attempt found for this user and topic.' });
    }
  } catch (error) {
    console.error(`Error fetching active quiz attempt for user ${req.query.userId}, topic ${req.query.topicId}:`, error);
    next(error);
  }
});

module.exports = router; 