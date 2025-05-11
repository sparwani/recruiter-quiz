# Coding Conventions for RecruiterQuiz

This document outlines the coding conventions and best practices to be followed when developing the RecruiterQuiz application. Adhering to these conventions will help maintain code quality, readability, and consistency across the project.

## 1. Fundamental Principles

These core principles are inspired by the project's "Cursor Rules" and general software engineering best practices:

*   **Write Clean, Simple, Readable Code:** Code should be easy to understand at a glance. Prioritize clarity over overly clever or complex solutions.
*   **Implement Features in the Simplest Possible Way:** Avoid over-engineering. Start with the most straightforward approach that meets requirements.
*   **Keep Files and Functions Small and Focused:**
    *   Aim for files to be less than 200-250 lines. If a file grows beyond this, consider splitting it into smaller, more focused modules.
    *   Functions should also be concise and do one thing well. If a function becomes too long or complex, break it down into smaller helper functions.
*   **Test After Every Meaningful Change:** (Manual testing for now) Ensure changes work as expected before moving on. (Automated testing is a future goal).
*   **Focus on Core Functionality Before Optimization:** Premature optimization can lead to complex code. Build working features first, then optimize if and where necessary based on performance data.
*   **Use Clear, Consistent Naming:**
    *   **JavaScript/React:**
        *   Variables and functions: `camelCase` (e.g., `quizAttemptId`, `handleSubmitAnswer`).
        *   Classes and React Components: `PascalCase` (e.g., `QuizPage`, `AdminService`).
        *   Constants: `UPPER_SNAKE_CASE` (e.g., `USER_ID`, `MAX_QUESTIONS`).
    *   **CSS Modules:** Class names should be descriptive and in `camelCase` (e.g., `styles.quizContainer`, `styles.actionButton`).
    *   **Files:**
        *   React Components: `ComponentName.jsx` (e.g., `QuizPage.jsx`).
        *   JavaScript modules/services: `moduleName.js` (e.g., `apiService.js`, `quizRoutes.js`).
        *   CSS Modules: `ComponentName.module.css` (e.g., `QuizPage.module.css`).
*   **Think Thoroughly Before Coding:** As per "Cursor Rules", spend time reasoning about the approach before writing code.

## 2. File Structure and Comments

*   **File-Top Comments:**
    *   Every file should start with a comment indicating its full path (e.g., `// src/services/QuizService.js`).
    *   Immediately below that, include a brief comment explaining the purpose of the file and how it fits into the larger project.
*   **Code Comments:**
    *   **Be Helpful:** Add comments to explain non-trivial logic, complex algorithms, or important decisions.
    *   **Explain "Why", Not "What":** Code should ideally explain *what* it's doing. Comments should explain *why* it's doing it that way, if not obvious.
    *   **Avoid Obvious Comments:** Do not comment on code that is self-explanatory (e.g., `// increment i by 1` for `i++`).
    *   **Keep Comments Up-to-Date:** If you change code, update its comments. Outdated comments are worse than no comments.
    *   **Document Changes:** When making significant changes, consider adding comments to explain the reasoning behind the change.
    *   **Clarity and Brevity:** Use clear, easy-to-understand language. Write in short, concise sentences.
    *   **TODOs:** Use `// TODO:` for tasks that need to be done later, and `// FIXME:` for known issues that need fixing. Include a brief explanation.

## 3. JavaScript and React Specifics

*   **Imports:**
    *   Group imports: React imports first, then external libraries, then local modules/components.
    *   Use named imports where possible for clarity.
*   **React:**
    *   Prefer functional components with Hooks (`useState`, `useEffect`, `useContext`, etc.).
    *   Destructure props at the beginning of the component function.
    *   Use `key` props correctly when rendering lists.
    *   Clearly name props and state variables.
*   **Variables:** Use `const` by default; use `let` only if the variable needs to be reassigned. Avoid `var`.
*   **Functions:** Prefer arrow functions for component event handlers and callbacks to maintain `this` context if ever needed (though less common with functional components).
*   **Error Handling (Client-Side):**
    *   Use `try...catch` blocks for API calls or other asynchronous operations that might fail.
    *   Provide user-friendly error messages. Update state to reflect error conditions for the UI.
*   **Asynchronous Code:**
    *   Prefer `async/await` for its readability when dealing with Promises.
    *   Always handle potential errors in `async` functions (e.g., with `try...catch`).

## 4. Backend (Node.js/Express) Specifics

*   **Error Handling (Server-Side):**
    *   Use `try...catch` in route handlers and service methods.
    *   Pass errors to Express's global error handler using `next(error)`.
    *   Return appropriate HTTP status codes for different error types (e.g., 400 for bad request, 404 for not found, 500 for server errors).
    *   Provide clear error messages in JSON responses.
*   **Validation:** Validate request parameters (body, query, path) in route handlers before passing data to services.
*   **Database Queries:** Keep database logic primarily within `src/db/queries.js` to separate concerns from service logic.

## 5. Linting and Formatting

*   **ESLint:** Adhere to the ESLint rules defined in `eslint.config.js`. Run the linter regularly.
*   **Formatting:** While not strictly enforced by a tool like Prettier yet in this project setup, aim for consistent formatting (indentation, spacing, line breaks) to improve readability. Consider integrating Prettier in the future.

## 6. Simplicity and Modularity

*   **DRY (Don't Repeat Yourself):** Encapsulate reusable logic in functions, custom hooks (React), or service methods (backend).
*   **Single Responsibility Principle:** Functions, components, and modules should ideally have one primary responsibility.
*   **Loose Coupling:** Aim for modules and components that are as independent as possible.

---
This document is a living guide and can be updated as the project evolves. 