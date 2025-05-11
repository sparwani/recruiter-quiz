// src/routes/adminRoutes.js
// Defines the API routes for the admin panel functionality.

const express = require('express');
const AdminService = require('../services/AdminService');
const dbQueries = require('../db/queries'); // To fetch topicName by topicId for generation

const router = express.Router();

// POST /admin/questions/generate - Triggers question generation
router.post('/questions/generate', async (req, res, next) => {
  try {
    const { topicId, numberOfQuestions } = req.body;
    if (!topicId || !numberOfQuestions) {
      return res.status(400).json({ error: 'topicId and numberOfQuestions are required.' });
    }
    if (isNaN(parseInt(topicId, 10)) || isNaN(parseInt(numberOfQuestions, 10))) {
        return res.status(400).json({ error: 'topicId and numberOfQuestions must be numbers.' });
    }
    if (parseInt(numberOfQuestions, 10) <= 0 || parseInt(numberOfQuestions, 10) > 10) { // Max 10 questions per batch for V1
        return res.status(400).json({ error: 'numberOfQuestions must be between 1 and 10.' });
    }

    // Fetch topic name to pass to OpenAI service for better context during generation
    const topics = await dbQueries.getAllTopics(); // Assuming this returns [{id, name}, ...]
    const selectedTopic = topics.find(t => t.id === parseInt(topicId, 10));

    if (!selectedTopic) {
        return res.status(404).json({ error: `Topic with ID ${topicId} not found.` });
    }

    const generatedQuestions = await AdminService.generateAndStoreQuestions(
      parseInt(topicId, 10),
      selectedTopic.name, 
      parseInt(numberOfQuestions, 10)
    );
    res.status(201).json({ 
        message: `${generatedQuestions.length} questions generated and are pending approval.`, 
        generatedQuestions 
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    next(error);
  }
});

// GET /admin/questions/pending - Fetches list of pending questions
router.get('/questions/pending', async (req, res, next) => {
  try {
    const pendingQuestions = await AdminService.getPendingApprovalQuestions();
    res.json(pendingQuestions);
  } catch (error) {
    console.error('Error fetching pending questions:', error);
    next(error);
  }
});

// GET /admin/questions/approved - Fetches list of all approved questions
router.get('/questions/approved', async (req, res, next) => {
  try {
    const topicId = req.query.topicId ? parseInt(req.query.topicId, 10) : null;
    if (req.query.topicId && isNaN(topicId)) {
        return res.status(400).json({ error: 'Invalid topicId query parameter.' });
    }
    const approvedQuestions = await AdminService.getListOfApprovedQuestions(topicId);
    res.json(approvedQuestions);
  } catch (error) {
    console.error('Error fetching approved questions:', error);
    next(error);
  }
});

// GET /admin/questions/deactivated - Fetches list of all deactivated questions
router.get('/questions/deactivated', async (req, res, next) => {
  try {
    const topicId = req.query.topicId ? parseInt(req.query.topicId, 10) : null;
    if (req.query.topicId && isNaN(topicId)) {
        return res.status(400).json({ error: 'Invalid topicId query parameter.' });
    }
    const deactivatedQuestions = await AdminService.getListOfDeactivatedQuestions(topicId);
    res.json(deactivatedQuestions);
  } catch (error) {
    console.error('Error fetching deactivated questions:', error);
    next(error);
  }
});

// POST /admin/questions/:id/approve - Approves a question
router.post('/questions/:id/approve', async (req, res, next) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    if (isNaN(questionId)) {
      return res.status(400).json({ error: 'Invalid question ID.' });
    }
    await AdminService.approveQuestionById(questionId);
    res.json({ message: `Question ${questionId} approved successfully.` });
  } catch (error) {
    console.error(`Error approving question ${req.params.id}:`, error);
    // Error message from service layer will be more generic like "not found or could not be approved"
    if (error.message.includes('not found or could not be approved')) {
        return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// POST /admin/questions/:id/deactivate - Deactivates a question (sets status to 'deactivated')
router.post('/questions/:id/deactivate', async (req, res, next) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    if (isNaN(questionId)) {
      return res.status(400).json({ error: 'Invalid question ID.' });
    }
    await AdminService.deactivateQuestionById(questionId);
    res.json({ message: `Question ${questionId} deactivated successfully.` });
  } catch (error) {
    console.error(`Error deactivating question ${req.params.id}:`, error);
    // Error message from service layer will be more generic
    if (error.message.includes('not found or could not be deactivated')) {
        return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// POST /admin/questions/:id/make-pending - Changes an approved/deactivated question's status back to 'pending'
router.post('/questions/:id/make-pending', async (req, res, next) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    if (isNaN(questionId)) {
      return res.status(400).json({ error: 'Invalid question ID.' });
    }
    await AdminService.makeQuestionPendingById(questionId); // New service function to be created
    res.json({ message: `Question ${questionId} status changed to pending.` });
  } catch (error) {
    console.error(`Error making question ${req.params.id} pending:`, error);
    if (error.message.includes('not found or could not be updated')) {
        return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /admin/questions/:id/reject - Rejects (deletes) a question
// This is a hard delete irrespective of status.
router.delete('/questions/:id/reject', async (req, res, next) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    if (isNaN(questionId)) {
      return res.status(400).json({ error: 'Invalid question ID.' });
    }
    await AdminService.rejectQuestionById(questionId);
    res.json({ message: `Question ${questionId} rejected and deleted successfully.` });
  } catch (error) {
    console.error(`Error rejecting question ${req.params.id}:`, error);
     if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router; 