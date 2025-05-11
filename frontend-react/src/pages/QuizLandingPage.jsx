import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as apiService from '../services/apiService';
import styles from './QuizLandingPage.module.css';

// frontend-react/src/pages/QuizLandingPage.jsx
// This page allows users to select a topic to start a quiz.

function QuizLandingPage() {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getTopics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.fetchTopics();
        setTopics(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch topics.');
        setTopics([]); // Ensure topics is an array even on error
      }
      setIsLoading(false);
    };
    getTopics();
  }, []);

  const handleTopicSelect = (topicId, topicName) => {
    // Navigate to the quiz page for the selected topic
    // The route will be like /quiz/:topicId
    // We also pass topicName via state for the QuizPage to display, avoiding an extra fetch if not needed there.
    navigate(`/quiz/${topicId}`, { state: { topicName } });
  };

  if (isLoading) {
    return <div className={styles.loadingText}>Loading topics...</div>;
  }

  if (error) {
    return <div className={styles.errorText}>Error: {error}</div>;
  }

  if (topics.length === 0) {
    return <p>No quiz topics available at the moment. Please check back later!</p>;
  }

  return (
    <div className={`container ${styles.quizLandingContainer}`}>
      <h1>Choose a Quiz Topic</h1>
      <ul className={styles.topicList}>
        {topics.map((topic) => (
          <li 
            key={topic.id} 
            className={styles.topicItem}
            onClick={() => handleTopicSelect(topic.id, topic.name)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleTopicSelect(topic.id, topic.name)}
          >
            <h2>{topic.name}</h2>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuizLandingPage; 
 