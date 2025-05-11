import React, { useState, useEffect } from 'react';
import * as apiService from '../services/apiService';
import styles from './QuestionGenerator.module.css';

function QuestionGenerator() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success'/'error', message: '...' }

  useEffect(() => {
    const loadTopics = async () => {
      try {
        setIsLoading(true);
        const fetchedTopics = await apiService.fetchTopics();
        setTopics(fetchedTopics || []);
        setStatusMessage(null);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
        setStatusMessage({ type: 'error', message: `Failed to load topics: ${error.message}` });
        setTopics([]); // Ensure topics is an array even on error
      } finally {
        setIsLoading(false);
      }
    };
    loadTopics();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedTopic) {
      setStatusMessage({ type: 'error', message: 'Please select a topic.' });
      return;
    }
    setIsLoading(true);
    setStatusMessage({ type: 'info', message: 'Generating questions, please wait...' }); // Using info for loading

    try {
      const result = await apiService.generateQuestions(selectedTopic, numQuestions);
      setStatusMessage({ type: 'success', message: result.message || `${result.generatedQuestions?.length || 0} questions generated successfully.` });
      // Optionally, trigger a refresh of the pending questions list if it's managed by a parent or context
    } catch (error) {
      console.error('Failed to generate questions:', error);
      setStatusMessage({ type: 'error', message: `Error generating questions: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div>
        <label htmlFor="admin-topic-select">Topic:</label>
        <select 
          id="admin-topic-select" 
          name="topicId" 
          value={selectedTopic} 
          onChange={(e) => setSelectedTopic(e.target.value)} 
          required
          disabled={isLoading || topics.length === 0}
        >
          <option value="">--Select a Topic--</option>
          {topics.map(topic => (
            <option key={topic.id} value={topic.id}>{topic.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="num-questions">Number of Questions (1-10):</label>
        <input 
          type="number" 
          id="num-questions" 
          name="numberOfQuestions" 
          min="1" 
          max="10" 
          value={numQuestions} 
          onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))} 
          required
          disabled={isLoading}
        />
      </div>
      <button type="submit" disabled={isLoading || !selectedTopic}>
        {isLoading ? 'Generating...' : 'Generate Questions'}
      </button>
      {statusMessage && (
        <div 
          className={`
            ${styles.statusMessage} 
            ${statusMessage.type === 'success' ? styles.statusMessageSuccess : ''}
            ${statusMessage.type === 'error' ? styles.statusMessageError : ''}
            ${statusMessage.type === 'info' ? styles.statusMessageInfo : ''} // Assuming you add an info style
          `}
        >
          {statusMessage.message}
        </div>
      )}
    </form>
  );
}

export default QuestionGenerator; 
 
 