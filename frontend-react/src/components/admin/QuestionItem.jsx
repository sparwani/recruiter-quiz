import React, { useState } from 'react';
import styles from './QuestionItem.module.css';

// frontend-react/src/components/admin/QuestionItem.jsx
// Displays an individual question item and renders action buttons based on provided handlers.

function QuestionItem({ 
  question, 
  onApprove,      // Handler to approve a question
  onReject,       // Handler to reject/delete a question
  onMakePending,  // Handler to move a question to pending status
  onDeactivate    // Handler to deactivate a question
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState(null); // To show specific label on button being processed

  // Generic handler to wrap individual action calls
  const handleAction = async (actionFn, actionName, confirmMessage) => {
    if (actionFn && window.confirm(confirmMessage)) { // Check if actionFn is provided before confirming
      setIsProcessing(true);
      setProcessingAction(actionName);
      try {
        await actionFn(question.id);
      } catch (error) {
        // Error handling is primarily done in the parent view component, 
        // but you could log it here or set a local error state if needed.
        console.error(`Error performing ${actionName} for question ID ${question.id}:`, error);
      }
      // Parent component re-fetches and re-renders, so local processing state will reset.
      // If not, uncomment these:
      // setIsProcessing(false);
      // setProcessingAction(null);
    }
  };

  // Specific handlers using the generic one
  const handleApprove = () => handleAction(
    onApprove, 
    'Approve', 
    `Are you sure you want to approve question ID ${question.id}?`
  );

  const handleReject = () => handleAction(
    onReject, 
    'Reject & Delete', 
    `PERMANENTLY DELETE question ID ${question.id}? This cannot be undone.`
  );

  const handleMakePending = () => handleAction(
    onMakePending, 
    'Make Pending', 
    `Are you sure you want to move question ID ${question.id} back to pending?`
  );

  const handleDeactivate = () => handleAction(
    onDeactivate,
    'Deactivate',
    `Are you sure you want to deactivate question ID ${question.id}? This will remove it from the active quiz pool.`
  );

  return (
    <li className={styles.questionItem}>
      <div className={styles.questionDetails}>
        <p><strong>ID:</strong> {question.id}</p>
        <p><strong>Topic:</strong> {question.topic_name || 'N/A'}</p>
        <p><strong>Type:</strong> {question.question_type}</p>
        <p><strong>Difficulty:</strong> {question.difficulty || 'N/A'}</p>
        <p><strong>Status:</strong> {question.status || 'N/A'}</p>
        <p><strong>Q:</strong> {question.question_text}</p>
        <p><strong>A:</strong> {question.answer_key}</p>
        {question.options && (
          <div>
            <strong>Options:</strong>
            <pre>{JSON.stringify(question.options, null, 2)}</pre>
          </div>
        )}
      </div>
      <div className={styles.questionActions}>
        {onApprove && (
          <button 
            onClick={handleApprove} 
            disabled={isProcessing} 
            className={`${styles.actionButton} ${styles.approveBtn}`}
          >
            {isProcessing && processingAction === 'Approve' ? 'Processing...' : 'Approve'}
          </button>
        )}
        {onMakePending && (
          <button 
            onClick={handleMakePending} 
            disabled={isProcessing} 
            className={`${styles.actionButton} ${styles.makePendingBtn}`}
          >
            {isProcessing && processingAction === 'Make Pending' ? 'Processing...' : 'Make Pending'}
          </button>
        )}
        {onDeactivate && (
          <button 
            onClick={handleDeactivate} 
            disabled={isProcessing} 
            className={`${styles.actionButton} ${styles.deactivateBtn}`}
          >
            {isProcessing && processingAction === 'Deactivate' ? 'Processing...' : 'Deactivate'}
          </button>
        )}
        {onReject && (
          <button 
            onClick={handleReject} 
            disabled={isProcessing} 
            className={`${styles.actionButton} ${styles.rejectBtn}`}
          >
            {isProcessing && processingAction === 'Reject & Delete' ? 'Processing...' : 'Reject & Delete'}
          </button>
        )}
      </div>
    </li>
  );
}

export default QuestionItem; 
 