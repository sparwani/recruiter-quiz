# System Architecture for RecruiterQuiz

This document outlines the architecture of the RecruiterQuiz application, covering the frontend, backend, database, and key data flows.

## 1. Overall Architecture

RecruiterQuiz employs a classic client-server architecture:

*   **Frontend (Client):** A Single Page Application (SPA) built with React and Vite. It is responsible for the user interface, user interactions, and communication with the backend API.
*   **Backend (Server):** A Node.js application using the Express.js framework. It handles business logic, interacts with the database, integrates with external services (OpenAI), and exposes a RESTful API for the frontend.
*   **Database:** A PostgreSQL relational database stores all persistent data, such as users (implicitly, via `user_id`), topics, questions, answers, and quiz attempts.
*   **External Services:**
    *   **OpenAI API:** Used for generating new quiz questions and grading free-text answers.

The frontend and backend are developed as separate projects within the same monorepo but are run as independent processes.

## 2. Backend Architecture (Node.js / Express)

The backend application, located in the `/src` directory, follows a layered approach:

*   **`app.js` (Entry Point):** Initializes the Express server, sets up global middleware (e.g., JSON parsing, URL encoding), mounts API routes, and includes a basic global error handler.
*   **`/routes`:** Defines the API endpoints. Each route file groups related endpoints (e.g., `quizRoutes.js`, `adminRoutes.js`). Route handlers are responsible for:
    *   Validating incoming request parameters.
    *   Calling appropriate service methods to perform business logic.
    *   Formatting and sending HTTP responses (success or error).
*   **`/services`:** Contains the core business logic of the application. Services (e.g., `QuizService.js`, `AdminService.js`, `OpenAIService.js`) encapsulate specific functionalities:
    *   `QuizService`: Manages quiz sessions, fetching questions, submitting answers, and quiz attempt progress.
    *   `AdminService`: Handles administrative tasks like question approval, deactivation, and generation requests.
    *   `OpenAIService`: Interacts with the OpenAI API for AI-powered features.
    *   Services interact with database query functions and may call other services.
*   **`/db` (Database Layer):**
    *   `db.js`: Configures and exports the Knex.js instance for database connectivity.
    *   `queries.js`: Contains functions that execute specific SQL queries using Knex.js. This abstracts the raw SQL or Knex query building from the services, promoting reusability and separation of concerns.
    *   `/migrations`: Stores Knex.js migration files, which define the database schema and its evolution over time.
    *   `/seeds`: Stores Knex.js seed files, used to populate the database with initial or test data.
*   **`/config`:** Manages application configuration, primarily through `index.js` which loads environment variables using `dotenv` from an `.env` file.
*   **`knexfile.js` (Root):** Provides database connection configurations for Knex.js, used by the Knex CLI for migrations and seeds.

## 3. Frontend Architecture (React / Vite)

The frontend application, located in the `/frontend-react` directory, is built using React and Vite.

*   **`main.jsx` (Entry Point):** Initializes the React application and renders the root `App` component into the DOM.
*   **`App.jsx`:** The root component that sets up the React Router for client-side navigation and defines the main layout structure (e.g., navigation bar).
*   **`/pages`:** Contains top-level components that represent distinct pages or views of the application (e.g., `QuizLandingPage.jsx`, `QuizPage.jsx`, `AdminPage.jsx`). Pages are typically responsible for:
    *   Fetching data required for the view (often via custom hooks or by calling API service functions).
    *   Managing page-specific state.
    *   Composing and rendering UI by using components from `/components`.
*   **`/components`:** Contains reusable UI components used across various pages or within other components (e.g., `QuestionItem.jsx`, `QuestionGenerator.jsx`).
    *   The `/components/admin` subdirectory further organizes components specific to the admin panel.
*   **`/hooks`:** (Currently minimal, but intended for) Custom React hooks to encapsulate reusable stateful logic and side effects (e.g., data fetching, form handling). `useQuizSession.js` was a proposed example.
*   **`/services/apiService.js`:** A utility module that centralizes API call functions. It provides a clean interface for components and pages to interact with the backend API, handling request construction and basic response processing.
*   **`/styles`:** Contains global styles (`global.css`) and potentially other shared style assets. CSS Modules are used for component-level styling (e.g., `QuizPage.module.css`) to ensure styles are scoped locally to components.
*   **State Management:** Currently, state is primarily managed within components using React's built-in hooks (`useState`, `useEffect`, `useRef`). For more complex global state, React Context API or a dedicated state management library (like Redux or Zustand) could be considered in the future.
*   **Vite (`vite.config.js`):** Configures the Vite development server and build process, including proxy settings for API requests to the backend during development (to avoid CORS issues).

## 4. Database Structure (PostgreSQL)

The database schema is defined and managed by Knex.js migrations located in `src/db/migrations/`. Key tables include:

*   **`topics`:** Stores quiz topics (e.g., "Front-End", "Back-End").
*   **`questions`:** Stores individual quiz questions, their type (multiple-choice, free-text), options (for MCQ), answer keys (for MCQ), and status (pending, active, deactivated).
*   **`quiz_attempts`:** Tracks each attempt a user makes on a quiz topic, including start/end times, current score, and progress (e.g., current question index, total questions in that attempt).
*   **`answers`:** Records each answer submitted by a user for a specific question within a quiz attempt, along with the score received and any feedback.

(Refer to the migration files for detailed column definitions, constraints, and relationships.)

## 5. Key Data Flows

**A. Starting/Resuming a Quiz:**

1.  **Frontend (`QuizPage.jsx`):**
    *   User navigates to a quiz for a specific `topicId`.
    *   `useEffect` hook triggers.
    *   Calls `apiService.fetchActiveQuizAttempt(userId, topicId)`.
2.  **Backend (`quizRoutes.js` -> `QuizService.js` -> `queries.js`):**
    *   If an "in-progress" attempt exists for the user/topic, its details (attempt ID, current score, current question index, total questions for that attempt) are returned.
    *   If no active attempt, `apiService.startQuiz(userId, topicId)` is called by the frontend.
    *   Backend's `QuizService.startQuizAttempt` creates a new entry in `quiz_attempts`, determines the set of questions for this new attempt (and their count), and returns the new attempt ID and total questions.
3.  **Frontend (`QuizPage.jsx`):**
    *   Receives attempt details (ID, score, progress, total questions).
    *   Calls `apiService.fetchQuizQuestions(topicId, userId)` to get the list of questions for the session (these are questions not yet answered correctly in *any* previous attempt for this topic by this user, or all questions if it's a new attempt where this filtering happens during `startNewQuizAttempt`).
    *   Displays the first appropriate question (index 0 of fetched questions if resuming and questions are filtered, or based on `current_question_index` from the attempt if all questions for the attempt were fetched initially).

**B. Submitting an Answer:**

1.  **Frontend (`QuizPage.jsx`):**
    *   User types/selects an answer and clicks "Submit".
    *   `handleSubmitAnswer` function is called.
    *   Payload is constructed (question details, user answer, user ID, quiz attempt ID, current score, current answered index).
    *   Calls `apiService.submitAnswerAndUpdateProgress(payload)`.
2.  **Backend (`quizRoutes.js` -> `QuizService.js` -> `OpenAIService.js` / `queries.js`):**
    *   `QuizService.submitAnswer` is invoked.
    *   If free-text, calls `OpenAIService.gradeFreeTextAnswer` with question text and user answer.
    *   If multiple-choice, grades locally against the answer key.
    *   Stores the answer, score, and feedback in the `answers` table via `dbQueries.storeAnswer`.
    *   Updates the `quiz_attempts` table (current score, current question index) via `dbQueries.updateQuizAttemptProgress`.
    *   Returns the score for *this* answer, feedback, and suggested answer to the frontend.
3.  **Frontend (`QuizPage.jsx`):**
    *   Receives grading result.
    *   Updates UI with feedback, score.
    *   Updates local state for total score and number of answers submitted.
    *   Enables "Next Question" button or shows quiz completion message.

---
This provides a solid overview. We can refine and add more details as needed. 