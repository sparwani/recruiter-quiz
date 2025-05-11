# API Documentation for RecruiterQuiz

This document provides details for all backend API endpoints. All API routes are prefixed with `/api` for quiz-related endpoints and `/admin` for admin-related endpoints, as mounted in `src/app.js`.

## Quiz API Endpoints (`/api`)

These endpoints are defined in `src/routes/quizRoutes.js`.

---

### 1. Get All Quiz Topics

*   **Endpoint:** `GET /api/topics`
*   **Description:** Fetches a list of all available quiz topics.
*   **Request Parameters:** None.
*   **Success Response (200 OK):**
    *   **Body:** `Array` of topic objects.
    *   **Example:**
        ```json
        [
          { "id": 1, "name": "Front-End Development" },
          { "id": 2, "name": "Back-End Development" }
        ]
        ```
*   **Error Responses:**
    *   `500 Internal Server Error`: If there's an issue fetching topics from the database.

---

### 2. Start a New Quiz Attempt

*   **Endpoint:** `POST /api/quiz/start`
*   **Description:** Starts a new quiz attempt for a given user and topic. If an active attempt already exists, this endpoint might still create a new one based on current service logic, or the service might be updated to resume. (Current behavior: `QuizService.startQuizAttempt` creates a new attempt).
*   **Request Body:** `JSON`
    *   `userId` (Number, required): The ID of the user starting the quiz.
    *   `topicId` (Number, required): The ID of the topic for the quiz.
    *   **Example:**
        ```json
        {
          "userId": 1,
          "topicId": 2
        }
        ```
*   **Success Response (201 Created):**
    *   **Body:** `JSON` object containing details of the new quiz attempt.
    *   **Example:**
        ```json
        {
          "quizAttemptId": 123,
          "totalQuestionsInAttempt": 10
        }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If `userId` or `topicId` are missing or not numbers.
        ```json
        { "error": "Missing userId or topicId in request body." }
        // or
        { "error": "Invalid userId or topicId. Both must be numbers." }
        ```
    *   `500 Internal Server Error`: If the quiz attempt could not be started on the server.
        ```json
        { "error": "Could not start quiz attempt on the server." }
        ```

---

### 3. Get Quiz Questions for a Session

*   **Endpoint:** `GET /api/quiz/:topicId/questions`
*   **Description:** Fetches all available questions for a given topic ID and user ID. "Available" typically means questions the user hasn't answered correctly in a recent attempt for that topic, or all questions for a brand new attempt.
*   **Path Parameters:**
    *   `:topicId` (Number, required): The ID of the topic.
*   **Query Parameters:**
    *   `userId` (Number, optional, defaults to 1): The ID of the user.
*   **Success Response (200 OK):**
    *   **Body:** `Array` of question objects, or an empty array if no questions are available.
    *   **Question Object Example:**
        ```json
        {
          "id": 5,
          "topic_id": 2,
          "question_text": "Explain the concept of RESTful APIs.",
          "question_type": "free-text",
          "options": null, // or {"A": "Option 1", "B": "Option 2"} for MCQ
          "answer_key": null, // or "A" for MCQ
          "status": "active",
          "created_at": "2023-10-26T10:00:00.000Z",
          "updated_at": "2023-10-26T10:00:00.000Z"
        }
        ```
    *   **Example (No Questions):**
        ```json
        []
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If `topicId` or `userId` (if provided) is not a valid number.
        ```json
        { "error": "Invalid topic ID" }
        // or
        { "error": "Invalid user ID" }
        ```
    *   `500 Internal Server Error`: If there's an issue fetching questions.

---

### 4. Submit an Answer

*   **Endpoint:** `POST /api/answers`
*   **Description:** Submits a user's answer to a question, grades it, and records the progress.
*   **Request Body:** `JSON`
    *   `questionId` (Number, required): ID of the question being answered.
    *   `questionText` (String, required): Full text of the question.
    *   `questionType` (String, required): Type of question (`'multiple-choice'` or `'free-text'`).
    *   `userAnswer` (String/Number, required): The answer provided by the user.
    *   `mcqAnswerKey` (String, optional): The correct answer key (e.g., "A", "B"). Required if `questionType` is `'multiple-choice'`.
    *   `userId` (Number, required): ID of the user.
    *   `quizAttemptId` (Number, required): ID of the current quiz attempt.
    *   `answeredQuestionIndex` (Number, required): 0-based index of the question being answered within the current attempt's sequence.
    *   `currentTotalScoreBeforeThisAnswer` (Number, required): The user's total score for the current attempt *before* this answer is submitted.
    *   **Example:**
        ```json
        {
          "questionId": 5,
          "questionText": "Explain RESTful APIs.",
          "questionType": "free-text",
          "userAnswer": "REST is a set of architectural principles...",
          "userId": 1,
          "quizAttemptId": 123,
          "answeredQuestionIndex": 0,
          "currentTotalScoreBeforeThisAnswer": 0
        }
        ```
*   **Success Response (200 OK):**
    *   **Body:** `JSON` object with grading results.
    *   **Example:**
        ```json
        {
          "score": 4, // Score for this specific answer
          "feedback": "Good explanation, but you could mention HATEOAS.",
          "suggestedAnswer": "A comprehensive answer would include..."
        }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If required fields are missing, invalid, or inconsistent (e.g., `mcqAnswerKey` missing for MCQ, negative index/score).
        ```json
        { "error": "Missing required fields..." }
        // or
        { "error": "One or more numeric fields are invalid." }
        // or
        { "error": "Unsupported question type: some_type" }
        ```
    *   `500 Internal Server Error`: If there's an issue submitting or grading the answer.

---

### 5. Get Active Quiz Attempt

*   **Endpoint:** `GET /api/quiz/attempts/active`
*   **Description:** Fetches an active (status 'in-progress') quiz attempt for a specific user and topic.
*   **Query Parameters:**
    *   `userId` (Number, required): The ID of the user.
    *   `topicId` (Number, required): The ID of the topic.
*   **Success Response (200 OK):**
    *   **Body:** `JSON` object of the active quiz attempt.
    *   **Example:**
        ```json
        {
          "quizAttemptId": 123,
          "user_id": 1,
          "topic_id": 2,
          "start_time": "2023-10-27T10:00:00.000Z",
          "end_time": null,
          "status": "in-progress",
          "current_score": 5,
          "current_question_index": 1, // 0-based index of the *next* question to be answered
          "totalQuestionsInAttempt": 10
        }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If `userId` or `topicId` are missing or not numbers.
        ```json
        { "error": "Missing userId or topicId in query parameters." }
        ```
    *   `404 Not Found`: If no active quiz attempt is found for the user and topic.
        ```json
        { "message": "No active quiz attempt found for this user and topic." }
        ```
    *   `500 Internal Server Error`: If there's an issue fetching the attempt.

---

### 6. Get Next Question (Legacy)

*   **Endpoint:** `GET /api/questions/:topicId/next`
*   **Description:** Fetches the next available question for a topic. **Note: This endpoint is marked as (OLD) in `quizRoutes.js` and might be a candidate for removal or refactor if unused by the current frontend logic, as `GET /api/quiz/:topicId/questions` is more comprehensive for session-based question fetching.**
*   **Path Parameters:**
    *   `:topicId` (Number, required): The ID of the topic.
*   **Success Response (200 OK):**
    *   **Body:** `JSON` object of a single question.
    *   **Example:** (Similar to question object in point 3)
*   **Error Responses:**
    *   `400 Bad Request`: If `topicId` is invalid.
    *   `404 Not Found`: If no more questions are available.
        ```json
        { "message": "No more questions available for this topic at the moment." }
        ```
    *   `500 Internal Server Error`.

---
## Admin API Endpoints (`/admin`)

These endpoints are defined in `src/routes/adminRoutes.js`.

---

### 1. Generate New Questions

*   **Endpoint:** `POST /admin/questions/generate`
*   **Description:** Triggers the generation of a specified number of questions for a given topic using OpenAI. Generated questions are stored with a 'pending' status.
*   **Request Body:** `JSON`
    *   `topicId` (Number, required): The ID of the topic for which to generate questions.
    *   `numberOfQuestions` (Number, required): The number of questions to generate (must be between 1 and 10).
    *   **Example:**
        ```json
        {
          "topicId": 1,
          "numberOfQuestions": 5
        }
        ```
*   **Success Response (201 Created):**
    *   **Body:** `JSON` object with a success message and the list of generated questions.
    *   **Example:**
        ```json
        {
          "message": "5 questions generated and are pending approval.",
          "generatedQuestions": [
            { "id": 101, "topic_id": 1, "question_text": "...", "status": "pending", ... },
            // ... more questions
          ]
        }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If `topicId` or `numberOfQuestions` are missing, invalid, or out of range.
    *   `404 Not Found`: If the specified `topicId` does not exist.
    *   `500 Internal Server Error`: If an error occurs during question generation or storage.

---

### 2. Get Pending Questions

*   **Endpoint:** `GET /admin/questions/pending`
*   **Description:** Fetches a list of all questions that are currently in 'pending' status.
*   **Request Parameters:** None.
*   **Success Response (200 OK):**
    *   **Body:** `Array` of pending question objects (similar to the question object structure).
*   **Error Responses:**
    *   `500 Internal Server Error`.

---

### 3. Get Approved Questions

*   **Endpoint:** `GET /admin/questions/approved`
*   **Description:** Fetches a list of all questions that are currently in 'active' (approved) status. Can be filtered by `topicId`.
*   **Query Parameters:**
    *   `topicId` (Number, optional): If provided, filters questions by this topic ID.
*   **Success Response (200 OK):**
    *   **Body:** `Array` of approved question objects.
*   **Error Responses:**
    *   `400 Bad Request`: If `topicId` is provided but invalid.
    *   `500 Internal Server Error`.

---

### 4. Get Deactivated Questions

*   **Endpoint:** `GET /admin/questions/deactivated`
*   **Description:** Fetches a list of all questions that are currently in 'deactivated' status. Can be filtered by `topicId`.
*   **Query Parameters:**
    *   `topicId` (Number, optional): If provided, filters questions by this topic ID.
*   **Success Response (200 OK):**
    *   **Body:** `Array` of deactivated question objects.
*   **Error Responses:**
    *   `400 Bad Request`: If `topicId` is provided but invalid.
    *   `500 Internal Server Error`.

---

### 5. Approve a Question

*   **Endpoint:** `POST /admin/questions/:id/approve`
*   **Description:** Changes the status of a 'pending' question to 'active'.
*   **Path Parameters:**
    *   `:id` (Number, required): The ID of the question to approve.
*   **Request Body:** None.
*   **Success Response (200 OK):**
    *   **Body:** `JSON`
        ```json
        { "message": "Question 101 approved successfully." }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If `id` is invalid.
    *   `404 Not Found`: If the question is not found or could not be approved (e.g., already active).
    *   `500 Internal Server Error`.

---

### 6. Deactivate a Question

*   **Endpoint:** `POST /admin/questions/:id/deactivate`
*   **Description:** Changes the status of an 'active' question to 'deactivated'.
*   **Path Parameters:**
    *   `:id` (Number, required): The ID of the question to deactivate.
*   **Request Body:** None.
*   **Success Response (200 OK):**
    *   **Body:** `JSON`
        ```json
        { "message": "Question 101 deactivated successfully." }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If `id` is invalid.
    *   `404 Not Found`: If the question is not found or could not be deactivated.
    *   `500 Internal Server Error`.

---

### 7. Make a Question Pending

*   **Endpoint:** `POST /admin/questions/:id/make-pending`
*   **Description:** Changes the status of an 'active' or 'deactivated' question back to 'pending'.
*   **Path Parameters:**
    *   `:id` (Number, required): The ID of the question to make pending.
*   **Request Body:** None.
*   **Success Response (200 OK):**
    *   **Body:** `JSON`
        ```json
        { "message": "Question 101 status changed to pending." }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If `id` is invalid.
    *   `404 Not Found`: If the question is not found or could not be updated.
    *   `500 Internal Server Error`.

---

### 8. Reject (Delete) a Question

*   **Endpoint:** `DELETE /admin/questions/:id/reject`
*   **Description:** Permanently deletes a question from the database, regardless of its status. **Use with caution.**
*   **Path Parameters:**
    *   `:id` (Number, required): The ID of the question to delete.
*   **Request Body:** None.
*   **Success Response (200 OK):**
    *   **Body:** `JSON`
        ```json
        { "message": "Question 101 rejected and deleted successfully." }
        ```
*   **Error Responses:**
    *   `400 Bad Request`: If `id` is invalid.
    *   `404 Not Found`: If the question is not found.
    *   `500 Internal Server Error`. 