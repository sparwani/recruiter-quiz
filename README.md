# RecruiterQuiz: AI-Powered Quiz Practice for Technical Recruiters

RecruiterQuiz is a web application designed to help technical recruiters practice and improve their understanding of various technical domains. It features AI-powered grading for free-text answers and allows administrators to manage a dynamic question bank.

## Key Features

*   **Topic-Based Quizzes:** Select quizzes from various technical topics (e.g., Front-End, Back-End, DevOps).
*   **Diverse Question Types:** Supports both multiple-choice and free-text questions.
*   **AI-Powered Grading:** Free-text answers are graded by OpenAI, providing scores and constructive feedback.
*   **Dynamic Question Pool:** Questions are pulled for each quiz session, excluding those recently answered by the user.
*   **Admin Panel:**
    *   Generate new quiz questions using OpenAI.
    *   Review, approve, or deactivate questions.
    *   View question statistics (future enhancement).
*   **Quiz Resumption:** Users can resume in-progress quizzes.

## Technology Stack

*   **Backend:**
    *   Node.js
    *   Express.js
    *   PostgreSQL (database)
    *   Knex.js (SQL query builder and migrations)
    *   OpenAI API (for question generation and grading)
*   **Frontend:**
    *   React
    *   Vite (build tool and dev server)
    *   JavaScript (ES6+)
    *   CSS Modules
*   **Development:**
    *   `dotenv` for environment variable management.
    *   ESLint for code linting.

## Project Structure

```
recruiterquiz/
├── frontend-react/        # React frontend application (Vite based)
│   ├── public/            # Static assets for frontend (favicon, etc.) - Note: This is for Vite, not the old static site
│   ├── src/               # Frontend source code
│   │   ├── assets/
│   │   ├── components/
│   │   ├── contexts/      # (If used in future)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page-level components
│   │   ├── services/      # API service utilities
│   │   ├── styles/
│   │   └── main.jsx       # Entry point for React app
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html         # Main HTML file for Vite
│   ├── package.json
│   └── vite.config.js
├── src/                   # Backend Node.js application
│   ├── config/            # Configuration files (e.g., environment variables)
│   ├── db/                # Database related files
│   │   ├── migrations/    # Knex.js migration files
│   │   ├── seeds/         # Knex.js seed files
│   │   ├── db.js          # Knex.js connection setup
│   │   └── queries.js     # Database query functions
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic services
│   └── app.js             # Main Express application setup
├── .env.example           # Example environment variables file
├── .gitignore             # Git ignore file for the root project
├── knexfile.js            # Knex.js configuration
├── package.json           # Backend Node.js project dependencies & scripts
└── README.md              # This file
```

## Setup and Installation

**Prerequisites:**
*   Node.js (v18.x or later recommended)
*   npm (usually comes with Node.js)
*   PostgreSQL server running and accessible.

**Backend Setup:**

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sparwani/recruiter-quiz.git
    cd recruiter-quiz
    ```
2.  **Install backend dependencies:**
    ```bash
    npm install
    ```
3.  **Setup PostgreSQL Database:**
    *   Create a new PostgreSQL database (e.g., `recruiter_quiz_db`).
    *   Create a PostgreSQL user with privileges to access this database (or use an existing user).
4.  **Configure Environment Variables:**
    *   Copy `.env.example` to a new file named `.env` in the project root:
        ```bash
        cp .env.example .env
        ```
    *   Edit the `.env` file with your specific configuration:
        *   `DB_CLIENT=pg`
        *   `DB_HOST=localhost` (or your DB host)
        *   `DB_PORT=5432` (or your DB port)
        *   `DB_USER=your_db_user`
        *   `DB_PASSWORD=your_db_password`
        *   `DB_NAME=recruiter_quiz_db` (or your DB name)
        *   `OPENAI_API_KEY=your_openai_api_key`
        *   `PORT=3050` (or your preferred backend port)
5.  **Run Database Migrations and Seeds:**
    *   To create the database schema:
        ```bash
        npx knex migrate:latest
        ```
    *   To populate initial data (e.g., quiz topics):
        ```bash
        npx knex seed:run
        ```

**Frontend Setup:**

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend-react
    ```
2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```
3.  **Return to the project root directory:**
    ```bash
    cd ..
    ```

## Running the Application

1.  **Start the Backend Server:**
    *   From the project root (`recruiterquiz/`):
        ```bash
        npm run dev:server 
        ```
    *   This will typically start the backend server on the port specified in your `.env` file (e.g., `http://localhost:3050`).

2.  **Start the Frontend Development Server:**
    *   From the project root (`recruiterquiz/`), in a **new terminal window/tab**:
        ```bash
        npm run dev:client
        ```
    *   This will start the Vite development server, usually on `http://localhost:5173` (Vite's default) or another available port. The terminal output will confirm the exact URL.

3.  **Access the application:**
    *   Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`).

## Future Enhancements (Ideas)

*   User authentication and roles.
*   More sophisticated admin dashboard with analytics.
*   Support for image-based questions.
*   Timed quizzes.
*   User progress tracking across multiple sessions/topics.

## Contribution

(Details to be added if you plan to accept contributions. For now, can be omitted or state "Contributions are welcome. Please open an issue first to discuss what you would like to change.") 