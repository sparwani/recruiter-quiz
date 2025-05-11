import React, { useState, useEffect, useCallback } from 'react';
import * as apiService from '../../services/apiService';
import QuestionItem from './QuestionItem';
import styles from './ApprovedQuestionsView.module.css';

// frontend-react/src/components/admin/ApprovedQuestionsView.jsx
// This component displays approved questions and allows filtering by topic and moving questions back to pending.

const ApprovedQuestionsView = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(''); // Empty string for 'All Topics'
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch topics for the filter dropdown
  useEffect(() => {
    const loadTopics = async () => {
      setIsLoadingTopics(true);
      try {
        const topicsData = await apiService.fetchTopics();
        setTopics(topicsData);
      } catch (err) {
        setError(`Failed to load topics: ${err.message}`);
        // Keep the component usable, even if topics fail to load for filtering.
      }
      setIsLoadingTopics(false);
    };
    loadTopics();
  }, []);

  // Fetch approved questions based on selectedTopic
  const fetchApproved = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage(null); // Clear previous status messages on new fetch
    try {
      const topicIdToFetch = selectedTopic === '' ? null : parseInt(selectedTopic, 10);
      const data = await apiService.fetchApprovedQuestions(topicIdToFetch);
      setQuestions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch approved questions.');
      setQuestions([]); // Clear questions on error
    } finally {
      setIsLoading(false);
    }
  }, [selectedTopic]);

  useEffect(() => {
    fetchApproved();
  }, [fetchApproved]);

  const handleMakePendingQuestion = async (questionId) => {
    setStatusMessage(null);
    setError(null);
    try {
      await apiService.makeQuestionPending(questionId);
      setStatusMessage({ type: 'success', text: `Question ID ${questionId} moved to pending successfully.` });
      fetchApproved(); // Refresh the list of approved questions
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Failed to move question ID ${questionId} to pending: ${err.message}` });
    }
  };

  const handleDeactivateQuestion = async (questionId) => {
    setStatusMessage(null);
    setError(null);
    try {
      await apiService.deactivateQuestion(questionId);
      setStatusMessage({ type: 'success', text: `Question ID ${questionId} deactivated successfully.` });
      fetchApproved();
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Failed to deactivate question ID ${questionId}: ${err.message}` });
    }
  };

  const handleTopicChange = (event) => {
    setSelectedTopic(event.target.value);
  };
  
  const clearStatusMessage = () => {
    setStatusMessage(null);
  };

  return (
    <div className={styles.viewContainer}>
      <h2>Manage Approved Questions</h2>
      
      <div className={styles.filterControls}>
        <label htmlFor="topicFilter">Filter by Topic:</label>
        <select 
          id="topicFilter" 
          value={selectedTopic} 
          onChange={handleTopicChange} 
          disabled={isLoadingTopics || isLoading}
        >
          <option value="">All Topics</option>
          {topics.map(topic => (
            <option key={topic.id} value={topic.id}>{topic.name}</option>
          ))}
        </select>
        <button onClick={fetchApproved} disabled={isLoading || isLoadingTopics}>
          {isLoading ? 'Refreshing...' : 'Refresh Approved Questions'}
        </button>
      </div>

      {isLoadingTopics && <p className={styles.loadingText}>Loading topics...</p>}

      {statusMessage && (
        <div 
          className={`${styles.statusMessage} ${statusMessage.type === 'success' ? styles.statusMessageSuccess : styles.statusMessageError}`}
          onClick={clearStatusMessage}
          style={{cursor: 'pointer'}}
        >
          {statusMessage.text}
        </div>
      )}

      {error && <p className={styles.statusMessageError}>Error: {error}</p>}
      
      {isLoading && questions.length === 0 && <p className={styles.loadingText}>Loading approved questions...</p>}
      
      {!isLoading && !error && questions.length === 0 && (
        <p className={styles.noQuestionsText}>No approved questions found{selectedTopic ? ' for the selected topic' : ''}.</p>
      )}

      {questions.length > 0 && (
        <ul className={styles.questionsList}>
          {questions.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              onMakePending={handleMakePendingQuestion}
              onDeactivate={handleDeactivateQuestion}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ApprovedQuestionsView; 
 