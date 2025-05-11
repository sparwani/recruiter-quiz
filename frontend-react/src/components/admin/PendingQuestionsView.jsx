import React, { useState, useEffect, useCallback } from 'react';
import * as apiService from '../../services/apiService';
import QuestionItem from './QuestionItem';
import styles from './PendingQuestionsView.module.css';

const PendingQuestionsView = () => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);
    try {
      const data = await apiService.fetchPendingQuestions();
      setQuestions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch pending questions.');
      setQuestions([]); // Clear questions on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleApproveQuestion = async (questionId) => {
    setStatusMessage(null);
    setError(null);
    try {
      await apiService.approveQuestion(questionId);
      setStatusMessage({ type: 'success', text: `Question ID ${questionId} approved successfully.` });
      fetchQuestions(); // Refresh the list
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Failed to approve question ID ${questionId}: ${err.message}` });
    }
  };

  const handleRejectQuestion = async (questionId) => {
    setStatusMessage(null);
    setError(null);
    try {
      await apiService.rejectQuestion(questionId);
      setStatusMessage({ type: 'success', text: `Question ID ${questionId} rejected and deleted successfully.` });
      fetchQuestions(); // Refresh the list
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Failed to reject question ID ${questionId}: ${err.message}` });
    }
  };

  const clearStatusMessage = () => {
    setStatusMessage(null);
  };

  return (
    <div>
      <h2>Pending Approval</h2>
      <button onClick={fetchQuestions} disabled={isLoading}>
        {isLoading ? 'Refreshing...' : 'Refresh Pending Questions'}
      </button>

      {statusMessage && (
        <div 
          className={`${styles.statusMessage} ${statusMessage.type === 'success' ? styles.statusMessageSuccess : styles.statusMessageError}`}
          onClick={clearStatusMessage} // Allow dismissing by clicking
          style={{cursor: 'pointer'}} // Indicate it's clickable
        >
          {statusMessage.text}
        </div>
      )}

      {error && <p className={styles.statusMessageError}>Error: {error}</p>}
      
      {isLoading && questions.length === 0 && <p className={styles.loadingText}>Loading questions...</p>}
      
      {!isLoading && !error && questions.length === 0 && (
        <p className={styles.noQuestionsText}>No pending questions at the moment.</p>
      )}

      {questions.length > 0 && (
        <ul className={styles.questionsListContainer}>
          {questions.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              onApprove={handleApproveQuestion}
              onReject={handleRejectQuestion}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingQuestionsView; 
 