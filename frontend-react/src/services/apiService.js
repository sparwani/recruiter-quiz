// frontend-react/src/services/apiService.js

const BASE_URL = ''; // Assuming proxy handles the full path to the backend server

/**
 * Fetches all topics from the backend.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of topic objects.
 * @throws {Error} If the network response is not ok or if parsing error JSON fails.
 */
export async function fetchTopics() {
  const response = await fetch(`${BASE_URL}/api/topics`);
  if (!response.ok) {
    // Try to parse error response, provide a fallback if parsing fails
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from server.' }));
    // Use error message from backend if available, otherwise a generic HTTP status error
    throw new Error(errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json(); // Assuming successful response is always JSON
}

/**
 * Submits a request to generate new questions for a specific topic.
 * @param {number} topicId - The ID of the topic for which to generate questions.
 * @param {number} numberOfQuestions - The number of questions to generate.
 * @returns {Promise<object>} A promise that resolves to the backend's response object upon successful generation.
 * @throws {Error} If the network response is not ok or if parsing error JSON fails.
 */
export async function generateQuestions(topicId, numberOfQuestions) {
  const response = await fetch(`${BASE_URL}/admin/questions/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Ensure that topicId and numberOfQuestions are correctly parsed as integers if they come from form inputs (which are strings)
    body: JSON.stringify({ topicId: parseInt(topicId, 10), numberOfQuestions: parseInt(numberOfQuestions, 10) }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from server.' }));
    throw new Error(errorData.error?.message || errorData.message || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches all pending questions from the backend.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of pending question objects.
 * @throws {Error} If the network response is not ok.
 */
export async function fetchPendingQuestions() {
  const response = await fetch(`${BASE_URL}/admin/questions/pending`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from server.' }));
    throw new Error(errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Approves a question by its ID.
 * @param {number} questionId - The ID of the question to approve.
 * @returns {Promise<object>} A promise that resolves to the backend's response object.
 * @throws {Error} If the network response is not ok.
 */
export async function approveQuestion(questionId) {
  const response = await fetch(`${BASE_URL}/admin/questions/${questionId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // Though body is empty, Content-Type can be good practice
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from server.' }));
    throw new Error(errorData.error?.message || errorData.message || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

/**
 * Rejects (deletes) a question by its ID.
 * @param {number} questionId - The ID of the question to reject.
 * @returns {Promise<object>} A promise that resolves to the backend's response object.
 * @throws {Error} If the network response is not ok.
 */
export async function rejectQuestion(questionId) {
  const response = await fetch(`${BASE_URL}/admin/questions/${questionId}/reject`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from server.' }));
    throw new Error(errorData.error?.message || errorData.message || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches all approved questions from the backend, optionally filtered by topic.
 * @param {number | null} topicId - Optional ID of the topic to filter by. If null, fetches all approved questions.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of approved question objects.
 * @throws {Error} If the network response is not ok.
 */
export async function fetchApprovedQuestions(topicId = null) {
  let url = `${BASE_URL}/admin/questions/approved`;
  if (topicId !== null) {
    url += `?topicId=${topicId}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from server.' }));
    throw new Error(errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Changes an approved question's status back to 'pending'.
 * @param {number} questionId - The ID of the question to make pending.
 * @returns {Promise<object>} A promise that resolves to the backend's response object.
 * @throws {Error} If the network response is not ok.
 */
export async function makeQuestionPending(questionId) {
  const response = await fetch(`${BASE_URL}/admin/questions/${questionId}/make-pending`, {
    method: 'POST', // Or PUT, depending on backend API design
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from server.' }));
    throw new Error(errorData.error?.message || errorData.message || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches all deactivated questions from the backend, optionally filtered by topic.
 * @param {number | null} topicId - Optional ID of the topic to filter by. If null, fetches all deactivated questions.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of deactivated question objects.
 * @throws {Error} If the network response is not ok.
 */
export async function fetchDeactivatedQuestions(topicId = null) {
  let url = `${BASE_URL}/admin/questions/deactivated`;
  if (topicId !== null && topicId !== '') { // Also check for empty string if that means 'all topics'
    url += `?topicId=${topicId}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from server.' }));
    throw new Error(errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Deactivates a question by its ID.
 * @param {number} questionId - The ID of the question to deactivate.
 * @returns {Promise<object>} A promise that resolves to the backend's response object.
 * @throws {Error} If the network response is not ok.
 */
export async function deactivateQuestion(questionId) {
  const response = await fetch(`${BASE_URL}/admin/questions/${questionId}/deactivate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from server.' }));
    throw new Error(errorData.error?.message || errorData.message || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

// --- Quiz Flow API Functions ---

/**
 * Fetches an active quiz attempt for a user and topic.
 * @param {number} userId - The ID of the user.
 * @param {number} topicId - The ID of the topic.
 * @returns {Promise<object|null>} A promise that resolves to the active quiz attempt object, or null if not found (404).
 * @throws {Error} If the network response is not ok (excluding 404) or if parsing error JSON fails.
 */
export async function fetchActiveQuizAttempt(userId, topicId) {
  console.log(`[ApiService] fetchActiveQuizAttempt called with userId: ${userId}, topicId: ${topicId}`);
  try {
    const response = await fetch(`${BASE_URL}/api/quiz/attempts/active?userId=${userId}&topicId=${topicId}`);
    console.log(`[ApiService] fetchActiveQuizAttempt response status: ${response.status} for userId: ${userId}, topicId: ${topicId}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[ApiService] fetchActiveQuizAttempt received 404, returning null. userId: ${userId}, topicId: ${topicId}`);
        return null; 
      }
      const errorData = await response.text(); // Try to get more error info
      console.error(`[ApiService] fetchActiveQuizAttempt network error. Status: ${response.status}, Data: ${errorData}`);
      throw new Error(`Network response was not ok for fetchActiveQuizAttempt. Status: ${response.status}, Message: ${errorData}`);
    }
    const data = await response.json();
    console.log(`[ApiService] fetchActiveQuizAttempt received data:`, data);
    return data;
  } catch (error) {
    console.error(`[ApiService] Error in fetchActiveQuizAttempt for userId: ${userId}, topicId: ${topicId}:`, error);
    throw error; // Re-throw to allow QuizPage to handle it
  }
}

/**
 * Starts a new quiz attempt on the backend.
 * @param {number} userId - The ID of the user.
 * @param {number} topicId - The ID of the topic for the quiz.
 * @returns {Promise<object>} A promise that resolves to the entire 'data' object received from the backend.
 * @throws {Error} If the network response is not ok or if quizAttemptId is not returned.
 */
export async function startQuiz(userId, topicId) {
  const response = await fetch(`${BASE_URL}/api/quiz/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, topicId }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from server.' }));
    throw new Error(errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (!data.quizAttemptId || data.totalQuestionsInAttempt === undefined) { // Check for both properties
    // It's good practice to log what was actually received if it's not what's expected.
    console.error('Incomplete data received from /api/quiz/start:', data);
    throw new Error('Incomplete quiz attempt data received from server (missing quizAttemptId or totalQuestionsInAttempt).');
  }
  return data; // Return the whole data object
}

/**
 * Fetches quiz questions for a given topic and user.
 * Backend filters out questions answered by the user in the last 24 hours.
 * @param {number} topicId - The ID of the topic.
 * @param {number} userId - The ID of the user (defaulting to 1 as per plan).
 * @returns {Promise<Array<object>>} A promise that resolves to an array of question objects for the quiz.
 * @throws {Error} If the network response is not ok.
 */
export async function fetchQuizQuestions(topicId, userId = 1) {
  const response = await fetch(`${BASE_URL}/api/quiz/${topicId}/questions?userId=${userId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from server.' }));
    throw new Error(errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Submits an answer and updates quiz progress.
 * This function POSTs all necessary data to the /api/answers endpoint.
 * @param {object} payload - The payload for the answer submission.
 * @param {number} payload.questionId - The ID of the question.
 * @param {string} payload.questionText - The text of the question.
 * @param {string} payload.questionType - The type of question ('multiple-choice', 'free-text').
 * @param {string} payload.userAnswer - The user's answer.
 * @param {string} [payload.mcqAnswerKey] - The answer key, if it's an MCQ question.
 * @param {number} payload.userId - The ID of the user.
 * @param {number} payload.quizAttemptId - The ID of the current quiz attempt.
 * @param {number} payload.answeredQuestionIndex - The 0-based index of the question just answered.
 * @param {number} payload.currentTotalScoreBeforeThisAnswer - The total score for the attempt before this answer.
 * @returns {Promise<object>} A promise that resolves to the grading result from the backend (e.g., { score, feedback, suggestedAnswer }).
 * @throws {Error} If the network response is not ok.
 */
export async function submitAnswerAndUpdateProgress(payload) {
  const response = await fetch(`${BASE_URL}/api/answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from server.' }));
    throw new Error(errorData.error?.message || errorData.message || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

/**
 * Submits a free-text answer to the backend for grading (by OpenAI via backend) and recording.
 * This function is now DEPRECATED. Use submitAnswerAndUpdateProgress instead.
 * @deprecated Use submitAnswerAndUpdateProgress for all answer submissions.
 * @param {object} questionDetails - The details of the question being answered.
 * @param {number} questionDetails.id - The ID of the question.
 * @param {string} questionDetails.question_text - The text of the question.
 * @param {string} questionDetails.question_type - The type of the question (should be 'free-text').
 * @param {string} userAnswer - The user's free-text answer.
 * @param {number} userId - The ID of the user.
 * @param {number} quizAttemptId - The ID of the current quiz attempt.
 * @param {number} answeredQuestionIndex - The 0-based index of the question just answered.
 * @param {number} currentTotalScoreBeforeThisAnswer - The total score for the attempt before this answer.
 * @returns {Promise<object>} A promise that resolves to the grading result from the backend (e.g., { score, feedback, suggestedAnswer }).
 * @throws {Error} If the network response is not ok.
 */
export async function gradeFreeTextAnswer(
  questionDetails,
  userAnswer,
  userId,
  quizAttemptId,
  answeredQuestionIndex,
  currentTotalScoreBeforeThisAnswer
) {
  console.warn("gradeFreeTextAnswer is deprecated. Use submitAnswerAndUpdateProgress instead.");
  const payload = {
    questionId: questionDetails.id,
    questionText: questionDetails.question_text,
    questionType: questionDetails.question_type,
    userAnswer,
    userId,
    quizAttemptId,
    answeredQuestionIndex,
    currentTotalScoreBeforeThisAnswer,
    // mcqAnswerKey will be undefined, which is correct for free-text
  };
  return submitAnswerAndUpdateProgress(payload);
}

/**
 * Records the details of a user's answer AFTER evaluation.
 * This function is now DEPRECATED as the backend /api/answers endpoint handles recording.
 * @deprecated Answer recording is handled by the backend via submitAnswerAndUpdateProgress.
 * @param {object} answerData - The data of the answer to record.
 * @param {number} answerData.quiz_attempt_id - ID of the quiz attempt.
 * @param {number} answerData.question_id - ID of the question.
 * @param {string} answerData.user_answer - The answer submitted by the user.
 * @param {number} answerData.score - The score achieved for this answer (normalized 0-1 or raw 0-5).
 * @param {boolean} answerData.is_correct - Whether the answer was correct.
 * @param {string} [answerData.feedback_text] - Textual feedback.
 * @param {string} [answerData.model_answer] - The model/correct answer.
 * @returns {Promise<object>} A promise that resolves to the backend's confirmation.
 * @throws {Error} If the network response is not ok.
 */
export async function recordAnswer(answerData) {
  // This function might not be needed if /api/answers handles recording comprehensively.
  // For now, let's assume it's still being called and point it to a non-existent or placeholder endpoint
  // to avoid breaking QuizPage if it still calls it, but log a deprecation.
  console.warn("recordAnswer is deprecated and does not call a valid endpoint. Answer recording is handled by submitAnswerAndUpdateProgress.");
  // To prevent errors if it were still called and expected a promise:
  return Promise.resolve({ message: "recordAnswer is deprecated." });

  /* // Original implementation if it were to call a specific record endpoint
  const response = await fetch(`${BASE_URL}/api/quiz/record_answer`, { // Hypothetical endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(answerData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from server.' }));
    throw new Error(errorData.error?.message || errorData.message || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
  */
}

// Note: submitLoadedAnswer was the old name for submitAnswerAndUpdateProgress.
// If QuizPage.jsx was using submitLoadedAnswer, it will now use submitAnswerAndUpdateProgress.
// The function `gradeFreeTextAnswer` has been updated to call `submitAnswerAndUpdateProgress`
// and marked as deprecated. `recordAnswer` is also marked as deprecated.

// We will add more functions here for other API calls (e.g., deactivating, etc.) 
 