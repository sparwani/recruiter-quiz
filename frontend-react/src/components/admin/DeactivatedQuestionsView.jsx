import React, { useState, useEffect, useCallback } from 'react';
import * as apiService from '../../services/apiService';
import QuestionItem from './QuestionItem';
import styles from './DeactivatedQuestionsView.module.css';

// frontend-react/src/components/admin/DeactivatedQuestionsView.jsx
// This component displays deactivated questions, allows filtering by topic, 
// and moving questions to 'approved' or 'pending' status.

const DeactivatedQuestionsView = () => {
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
      }
      setIsLoadingTopics(false);
    };
    loadTopics();
  }, []);

  // Fetch deactivated questions based on selectedTopic
  const fetchDeactivated = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);
    try {
      const topicIdToFetch = selectedTopic === '' ? null : parseInt(selectedTopic, 10);
      const data = await apiService.fetchDeactivatedQuestions(topicIdToFetch);
      setQuestions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch deactivated questions.');
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTopic]);

  useEffect(() => {
    fetchDeactivated();
  }, [fetchDeactivated]);

  const handleApproveQuestion = async (questionId) => {
    setStatusMessage(null);
    setError(null);
    try {
      await apiService.approveQuestion(questionId);
      setStatusMessage({ type: 'success', text: `Question ID ${questionId} approved successfully.` });
      fetchDeactivated(); // Refresh the list
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Failed to approve question ID ${questionId}: ${err.message}` });
    }
  };

  const handleMakePendingQuestion = async (questionId) => {
    setStatusMessage(null);
    setError(null);
    try {
      await apiService.makeQuestionPending(questionId);
      setStatusMessage({ type: 'success', text: `Question ID ${questionId} moved to pending successfully.` });
      fetchDeactivated(); // Refresh the list
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Failed to move question ID ${questionId} to pending: ${err.message}` });
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
      <h2>Manage Deactivated Questions</h2>
      
      <div className={styles.filterControls}>
        <label htmlFor="topicFilterDeactivated">Filter by Topic:</label>
        <select 
          id="topicFilterDeactivated" 
          value={selectedTopic} 
          onChange={handleTopicChange} 
          disabled={isLoadingTopics || isLoading}
        >
          <option value="">All Topics</option>
          {topics.map(topic => (
            <option key={topic.id} value={topic.id}>{topic.name}</option>
          ))}
        </select>
        <button onClick={fetchDeactivated} disabled={isLoading || isLoadingTopics}>
          {isLoading ? 'Refreshing...' : 'Refresh Deactivated Questions'}
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
      
      {isLoading && questions.length === 0 && <p className={styles.loadingText}>Loading deactivated questions...</p>}
      
      {!isLoading && !error && questions.length === 0 && (
        <p className={styles.noQuestionsText}>No deactivated questions found{selectedTopic ? ' for the selected topic' : ''}.</p>
      )}

      {questions.length > 0 && (
        <ul className={styles.questionsList}>
          {questions.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              onApprove={handleApproveQuestion}       // Pass handler to approve
              onMakePending={handleMakePendingQuestion} // Pass handler to make pending
              // No onReject for this view, as rejection is a hard delete.
              // Deactivation itself is a soft state change.
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default DeactivatedQuestionsView; 
 