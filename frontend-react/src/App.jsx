import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import QuizPage from './pages/QuizPage'; // Import QuizPage
import AdminPage from './pages/AdminPage';
import QuizLandingPage from './pages/QuizLandingPage'; // Import QuizLandingPage
// We can remove the default App.css or repurpose it for global styles later
// For now, let's remove the direct import here if we manage global styles elsewhere.
// import './App.css'; 

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              {/* Link to / or /topics, which will be the QuizLandingPage */}
              <Link to="/">Quiz Topics</Link> 
            </li>
            <li>
              <Link to="/admin">Admin Panel</Link>
            </li>
          </ul>
        </nav>

        <hr />

        <Routes>
          {/* Route for displaying a list of quiz topics */}
          <Route path="/" element={<QuizLandingPage />} />
          
          {/* Route for an active quiz session (to be created) */}
          <Route path="/quiz/:topicId" element={<QuizPage />} />
          
          <Route path="/admin" element={<AdminPage />} />
          {/* Add other routes here as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
