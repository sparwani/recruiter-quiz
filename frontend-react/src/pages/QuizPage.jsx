import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import * as apiService from '../services/apiService';
import styles from './QuizPage.module.css';

// frontend-react/src/pages/QuizPage.jsx
// Handles the active quiz session for a user on a selected topic.

const USER_ID = 1; // As per plan, use a fixed user ID for now.

// At the top of QuizPage component, for debugging StrictMode runs
let loadQuizDataRunCounter = 0; 

function QuizPage() {
  const { topicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const topicName = location.state?.topicName || 'Quiz';

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [quizAttemptId, setQuizAttemptId] = useState(null);
  const [totalScore, setTotalScore] = useState(0); // Will store raw score sum
  const [answersSubmitted, setAnswersSubmitted] = useState(0);
  const [originalTotalQuestions, setOriginalTotalQuestions] = useState(0);
  const [displayedQuestionNumber, setDisplayedQuestionNumber] = useState(1); // New state for display

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Ref to store the promise of the startQuiz API call
  const startQuizPromiseRef = useRef(null);
  // Ref to track the current topicId to manage resetting the promiseRef
  const currentTopicIdRef = useRef(null);

  useEffect(() => {
    const runId = ++loadQuizDataRunCounter; 
    const effectTopicId = topicId; 
    console.log(`[Run ${runId}] useEffect triggered. topicId: ${effectTopicId}. Current startQuizPromiseRef: ${startQuizPromiseRef.current ? 'Exists' : 'null'}`);

    // If topicId has changed from the one stored in currentTopicIdRef,
    // it means we are loading a new quiz. Clear the promise for the old topic.
    if (currentTopicIdRef.current !== effectTopicId) {
      console.log(`[Run ${runId}] Topic changed from ${currentTopicIdRef.current} to ${effectTopicId}. Clearing startQuizPromiseRef.`);
      startQuizPromiseRef.current = null;
      currentTopicIdRef.current = effectTopicId; // Update ref to current topicId
    }

    const loadQuizData = async () => {
      console.log(`[Run ${runId}] loadQuizData ASYNC START. topicId: ${effectTopicId}`);
      setIsLoading(true);
      setError(null);
      setFeedback(null);
      setUserAnswer('');
      
      setQuizAttemptId(null); 
      setQuestions([]);
      setCurrentQuestionIndex(0); 
      setTotalScore(0);          
      setAnswersSubmitted(0);    
      setOriginalTotalQuestions(0);
      setDisplayedQuestionNumber(1); // Reset for new load

      let attemptIdToUse = null; 
      let tempOriginalTotal = 0;
      let tempAnswersSubmitted = 0; // Temporary variable for initial setup

      try {
        console.log(`[Run ${runId}] Checking for active attempt...`);
        const activeAttempt = await apiService.fetchActiveQuizAttempt(USER_ID, parseInt(effectTopicId, 10));

        if (activeAttempt) {
          console.log(`[Run ${runId}] Found activeAttempt:`, activeAttempt);
          attemptIdToUse = activeAttempt.quizAttemptId;
          setQuizAttemptId(activeAttempt.quizAttemptId); 
          setTotalScore(activeAttempt.current_score || 0);
          tempAnswersSubmitted = activeAttempt.current_question_index || 0;
          setAnswersSubmitted(tempAnswersSubmitted);
          tempOriginalTotal = activeAttempt.totalQuestionsInAttempt || 0; 
          setOriginalTotalQuestions(tempOriginalTotal);
          setDisplayedQuestionNumber(tempAnswersSubmitted + 1); // Set based on resumed progress
          startQuizPromiseRef.current = Promise.resolve({ quizAttemptId: activeAttempt.quizAttemptId, totalQuestionsInAttempt: tempOriginalTotal });
        } else {
          console.log(`[Run ${runId}] No active attempt found. Preparing for a new quiz on topic ${effectTopicId}.`);
          
          if (!startQuizPromiseRef.current) {
            console.log(`[Run ${runId}] No promise in ref. Calling apiService.startQuiz for topic ${effectTopicId} and storing promise.`);
            startQuizPromiseRef.current = apiService.startQuiz(USER_ID, parseInt(effectTopicId, 10))
              .then(newAttemptData => { // newAttemptData is now { quizAttemptId, totalQuestionsInAttempt }
                console.log(`[Run ${runId}] Original apiService.startQuiz (topic ${effectTopicId}) resolved with data:`, newAttemptData);
                if (!newAttemptData || newAttemptData.quizAttemptId === undefined || newAttemptData.totalQuestionsInAttempt === undefined) {
                  throw new Error('Incomplete data from startQuiz service.');
                }
                return newAttemptData; 
              })
              .catch(err => {
                console.error(`[Run ${runId}] Original apiService.startQuiz (topic ${effectTopicId}) failed:`, err);
                startQuizPromiseRef.current = null; // Clear promise on failure to allow retry
                throw err; 
              });
          } else {
            console.log(`[Run ${runId}] Promise already in ref for topic ${effectTopicId}. Awaiting it.`);
          }

          try {
            console.log(`[Run ${runId}] Awaiting promise from startQuizPromiseRef for topic ${effectTopicId}...`);
            const attemptDetails = await startQuizPromiseRef.current; // attemptDetails is { quizAttemptId, totalQuestionsInAttempt }
            console.log(`[Run ${runId}] Awaited promise for topic ${effectTopicId}, got attempt details:`, attemptDetails);
            if (!attemptDetails || attemptDetails.quizAttemptId === undefined || attemptDetails.totalQuestionsInAttempt === undefined) {
                throw new Error('Incomplete attempt details from promise.');
            }
            attemptIdToUse = attemptDetails.quizAttemptId;
            tempOriginalTotal = attemptDetails.totalQuestionsInAttempt;
            setQuizAttemptId(attemptDetails.quizAttemptId);
            setOriginalTotalQuestions(attemptDetails.totalQuestionsInAttempt);
            setDisplayedQuestionNumber(tempAnswersSubmitted + 1); // Should be 1
          } catch (err) {
            console.error(`[Run ${runId}] Error awaiting startQuizPromiseRef for topic ${effectTopicId}:`, err);
            setError('Failed to start or retrieve quiz attempt ID.');
            setIsLoading(false); // Ensure loading stops
            return; // Exit loadQuizData for this run if attempt ID couldn't be secured
          }
        }

        console.log(`[Run ${runId}] attemptIdToUse for fetching questions: ${attemptIdToUse}, originalTotal: ${tempOriginalTotal}, initial display Q#: ${tempAnswersSubmitted + 1}`);
        if (attemptIdToUse) {
          const fetchedQuestions = await apiService.fetchQuizQuestions(parseInt(effectTopicId, 10), USER_ID);
          console.log(`[Run ${runId}] Fetched questions for session (attempt ${attemptIdToUse}):`, fetchedQuestions ? fetchedQuestions.length : 'null/empty', fetchedQuestions);
          if (fetchedQuestions && fetchedQuestions.length > 0) {
            setQuestions(fetchedQuestions);
            setCurrentQuestionIndex(0);
            if (tempOriginalTotal === 0) {
                console.warn(`[Run ${runId}] originalTotalQuestions was 0, estimating from fetched questions and answersSubmitted.`);
                const estimatedTotal = (tempAnswersSubmitted || 0) + fetchedQuestions.length;
                setOriginalTotalQuestions(estimatedTotal);
            }
          } else { 
            setQuestions([]);
            if (tempOriginalTotal > 0 && tempAnswersSubmitted >= tempOriginalTotal) {
                 setError(`You have answered all ${tempOriginalTotal} questions for this topic! Attempt ID: ${attemptIdToUse}`);
            } else if (tempOriginalTotal > 0 && fetchedQuestions.length === 0) {
                 setError(`All available questions for this session seem to be answered. Total in attempt: ${tempOriginalTotal}. Attempt ID: ${attemptIdToUse}`);
            } else {
                setError(`No questions available for this topic at the moment. Attempt ID: ${attemptIdToUse}`);
            }
          }
        } else {
          console.error(`[Run ${runId}] No attemptIdToUse was determined. Cannot fetch questions.`);
          setError('Could not obtain a quiz attempt ID to fetch questions.');
        }
      } catch (err) {
        console.error(`[Run ${runId}] CATCH block in loadQuizData (topic ${effectTopicId}):`, err);
        // Avoid clearing promise ref here if error is unrelated to its resolution
        // setError(err.message || 'Failed to load quiz data.');
        if (!error) { // Only set error if not already set by a more specific catch
            setError(err.message || 'An unexpected error occurred while loading quiz data.');
        }
        setQuestions([]); 
      } finally {
        console.log(`[Run ${runId}] loadQuizData ASYNC FINALLY block (topic ${effectTopicId}).`);
        setIsLoading(false);
      }
    };

    if (effectTopicId) { 
      loadQuizData();
    }
    
    return () => {
        console.log(`[Run ${runId}] useEffect CLEANUP. topicId: ${effectTopicId}. Current startQuizPromiseRef: ${startQuizPromiseRef.current ? 'Exists' : 'null'}`);
        // Do not clear startQuizPromiseRef here on every cleanup, 
        // as it's managed based on topicId change at the start of the effect.
    }
  }, [topicId]); // Dependency on topicId is correct

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (event) => {
    setUserAnswer(event.target.value);
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !quizAttemptId) {
      setError('Cannot submit answer: No current question or quiz attempt ID.');
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question_text,
        questionType: currentQuestion.question_type,
        userAnswer: userAnswer,
        mcqAnswerKey: currentQuestion.question_type === 'multiple-choice' ? currentQuestion.answer_key : undefined,
        userId: USER_ID,
        quizAttemptId: quizAttemptId,
        answeredQuestionIndex: answersSubmitted,
        currentTotalScoreBeforeThisAnswer: totalScore, 
      };

      const gradedData = await apiService.submitAnswerAndUpdateProgress(payload);
      const achievedScoreForThisQuestion = gradedData.score;

      setFeedback({
        type: achievedScoreForThisQuestion === 5 ? 'feedbackCorrect' 
            : (achievedScoreForThisQuestion > 0 ? 'feedbackPartial' : 'feedbackIncorrect'), 
        message: gradedData.feedback,
        modelAnswer: gradedData.suggestedAnswer || currentQuestion.answer_key,
        achievedScore: achievedScoreForThisQuestion,
        maxPossibleScore: 5, 
      });
      
      setTotalScore(prevScore => prevScore + achievedScoreForThisQuestion);
      setAnswersSubmitted(prevAnswersSubmitted => prevAnswersSubmitted + 1);

    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(err.message || 'Failed to submit or grade answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setUserAnswer('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setDisplayedQuestionNumber(prev => prev + 1); // Advance displayed number here
    } else {
      // Quiz finished
      console.log('Quiz finished. Final Score:', totalScore, 'Answers Submitted:', answersSubmitted);
      // displayedQuestionNumber will naturally be at originalTotalQuestions or originalTotalQuestions + 1 if all answered
    }
  };

  if (isLoading) {
    return <div className={styles.loadingText}>Loading quiz for {topicName}...</div>;
  }

  if (error) {
    return <div className={styles.errorText}>Error: {error} <button onClick={() => navigate('/')}>Back to Topics</button></div>;
  }

  if (!quizAttemptId && !isLoading) { // If loading is done and still no attempt ID (e.g. initial error before calls)
    return <div className={styles.errorText}>Could not initialize quiz. <button onClick={() => navigate('/')}>Back to Topics</button></div>;
  }
  
  if (questions.length === 0 && !isLoading) { // If loading is done, attempt ID might be set, but no questions
    return <div className={styles.quizCompleteMessage}>No questions available for this topic. <button onClick={() => navigate('/')}>Back to Topics</button></div>;
  }

  if (!currentQuestion && questions.length > 0 && !isLoading) {
    // This might happen if currentQuestionIndex is out of bounds after loading, though unlikely with current logic
    return <div className={styles.errorText}>Error displaying current question. <button onClick={() => navigate('/')}>Back to Topics</button></div>;
  }
  
  if (!currentQuestion && questions.length === 0 && !isLoading) { // Redundant with previous check, but specific for clarity
     return <div className={styles.quizCompleteMessage}>No questions loaded. Quiz cannot start. <button onClick={() => navigate('/')}>Back to Topics</button></div>;
  }

  // Derived state for rendering logic
  const hasMoreQuestionsInFetchedList = currentQuestionIndex < questions.length - 1;
  const allOriginalQuestionsAnswered = originalTotalQuestions > 0 && answersSubmitted >= originalTotalQuestions;

  return (
    <div className={`container ${styles.quizContainer}`}>
      <div className={styles.quizHeader}>
        <h1>{topicName} Quiz</h1>
        {originalTotalQuestions > 0 && (
          <p>Question {Math.min(displayedQuestionNumber, originalTotalQuestions)} of {originalTotalQuestions}</p>
        )}
        <p>Score: {totalScore}</p>
      </div>

      {currentQuestion && (
        <div className={styles.questionCard}>
          <p className={styles.questionText}>{currentQuestion.question_text}</p>
          
          {currentQuestion.question_type === 'multiple-choice' && currentQuestion.options && (
            <div className={styles.answerOptions}>
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <label key={key} className={styles.mcqLabel}>
                  <input 
                    type="radio" 
                    name={`question-${currentQuestion.id}`}
                    value={key} 
                    checked={userAnswer === key}
                    onChange={handleAnswerChange}
                    disabled={!!feedback || allOriginalQuestionsAnswered}
                  /> {value}
                </label>
              ))}
            </div>
          )}

          {currentQuestion.question_type === 'free-text' && (
            <textarea
              className={styles.answerInput} 
              value={userAnswer}
              onChange={handleAnswerChange}
              placeholder="Type your answer here..."
              disabled={!!feedback || allOriginalQuestionsAnswered}
            />
          )}
        </div>
      )}

      {feedback && (
        <div className={`${styles.feedbackArea} ${styles[feedback.type]}`}>
          <div className={styles.feedbackHeader}>
            <h3>Feedback</h3>
            <p className={styles.feedbackScore}>Score: {feedback.achievedScore} / {feedback.maxPossibleScore}</p>
          </div>
          <p className={styles.feedbackMessage}>{feedback.message}</p>
          {feedback.type !== 'feedbackCorrect' && feedback.modelAnswer && (
            <div className={styles.feedbackModelAnswerSection}>
              {/* <hr className={styles.feedbackSeparator} /> Optional separator, header already has one */}
              <p><strong>Suggested Answer:</strong></p>
              <p className={styles.feedbackModelAnswerText}>{feedback.modelAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* Submit button: Show if not all original questions answered AND no feedback yet AND there is a current question */}
      {!allOriginalQuestionsAnswered && currentQuestion && !feedback && (
        <div className={styles.quizActions}>
          <button 
            onClick={handleSubmitAnswer} 
            className={styles.actionButton} 
            disabled={isSubmitting || !userAnswer || !!feedback}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      )}

      {/* Next/Finished section: Show if feedback exists OR all original questions answered, AND there were questions to begin with */}
      {(feedback || allOriginalQuestionsAnswered) && originalTotalQuestions > 0 && ( // Ensure originalTotalQuestions > 0 before showing finish/next
         hasMoreQuestionsInFetchedList && !allOriginalQuestionsAnswered ? (
          <div className={styles.nextActionContainer}> 
            <button onClick={handleNextQuestion} className={`${styles.actionButton} ${styles.nextButton}`}>
              Next Question
            </button>
          </div>
        ) : (
          <div className={styles.quizCompleteMessage}>
            <p>Quiz Finished! Final Score: {totalScore} out of {originalTotalQuestions * 5}.</p>
            <button onClick={() => navigate('/')} className={styles.actionButton}>Back to Topics</button>
          </div>
        )
      )}
      {/* Fallback for when there are no questions initially and not loading */}
      {questions.length === 0 && !isLoading && !error && (
         <div className={styles.quizCompleteMessage}>No questions for this quiz. <button onClick={() => navigate('/')}>Back to Topics</button></div>
      )}
    </div>
  );
}

export default QuizPage; 
 
 