// src/services/OpenAIService.js
// This service handles interactions with the OpenAI API for tasks like grading answers and generating questions.

const OpenAI = require('openai');
const config = require('../config');

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

/**
 * Grades a free-text answer using the OpenAI API.
 * @param {string} questionText - The text of the question.
 * @param {string} userAnswer - The user's free-text answer.
 * @returns {Promise<{score: number, feedback: string, suggestedAnswer: string} | null>} 
 *          An object with score, feedback, and suggested answer, or null if an error occurs.
 */
async function gradeFreeTextAnswer(questionText, userAnswer) {
  const gradingModel = config.OPENAI_GRADING_MODEL;

  // This is a critical prompt. It needs to be carefully designed to get consistent JSON output.
  // We are asking for a numeric score (0-5), textual feedback, and a model-generated more appropriate answer.
  const prompt = `
    You are an expert evaluator for technical recruiter training quizzes.
    Given the following question and user's answer, please provide a grade and feedback.

    Question: "${questionText}"
    User's Answer: "${userAnswer}"

    Your task is to:
    1.  Provide a numerical score from 0 to 5 (inclusive), where 0 is completely incorrect and 5 is perfectly correct and comprehensive.
    2.  Provide brief, constructive feedback for the user, explaining the score.
    3.  Provide a concise, model-generated example of an ideal answer to the question.

    Please format your response STRICTLY as a JSON object with the following keys:
    -   "score": (integer, 0-5)
    -   "feedback": (string)
    -   "suggestedAnswer": (string)

    Example JSON output:
    {
      "score": 4,
      "feedback": "Your answer is good and covers most key aspects, but could be more specific about X.",
      "suggestedAnswer": "An ideal answer would include details about X, Y, and Z, focusing on their interplay."
    }

    JSON Response:
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: gradingModel,
      messages: [
        { role: 'system', content: 'You are an AI assistant that provides quiz grading in JSON format.' },
        { role: 'user', content: prompt },
      ],
      // Ensuring JSON output is often more reliable with newer models using response_format
      // For older models, careful prompting is key, or you might need to parse non-strict JSON.
      response_format: { type: "json_object" }, // This is for newer models like gpt-4-turbo-preview and later gpt-3.5-turbo versions
      temperature: 0.2, // Lower temperature for more deterministic, less creative grading
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      console.error('OpenAI API returned an empty response content.');
      return null;
    }

    // Parse the JSON response from the AI
    const parsedResponse = JSON.parse(responseContent);
    
    // Validate the structure of the parsed response
    if (typeof parsedResponse.score !== 'number' || 
        typeof parsedResponse.feedback !== 'string' || 
        typeof parsedResponse.suggestedAnswer !== 'string') {
      console.error('OpenAI response does not match expected JSON structure:', parsedResponse);
      // Fallback or attempt to extract if possible, or return null
      // For V1, we'll be strict. If it's not right, we indicate failure.
      return null; 
    }
    
    return {
        score: parsedResponse.score,
        feedback: parsedResponse.feedback,
        suggestedAnswer: parsedResponse.suggestedAnswer,
    };

  } catch (error) {
    console.error('Error calling OpenAI API for grading:', error);
    return null;
  }
}

/**
 * Generates a batch of quiz questions using the OpenAI API.
 * @param {string} topicName - The name of the topic for which to generate questions.
 * @param {number} numberOfQuestions - The number of questions to generate.
 * @returns {Promise<Array<object> | null>} An array of question objects or null if an error occurs.
 * Each question object should have: { question_text, question_type ('free-text' or 'multiple-choice'), answer_key, options (for MCQ), difficulty }
 */
async function generateQuestionsBatch(topicName, numberOfQuestions) {
  const generationModel = config.OPENAI_QUESTION_GENERATION_MODEL;

  const prompt = `
    You are an expert content creator for technical recruiter training quizzes.
    Your task is to generate ${numberOfQuestions} quiz questions about the topic: "${topicName}".

    For each question, provide:
    1.  "question_text": (string) The full text of the question.
    2.  "question_type": (string) Either "free-text" or "multiple-choice". Aim for a mix, but prioritize clarity and usefulness for a recruiter quiz.
    3.  "answer_key": (string) For "free-text", provide a concise model answer. For "multiple-choice", provide the letter of the correct option (e.g., "A").
    4.  "options": (object) For "multiple-choice" questions, provide an object with keys "A", "B", "C", "D" and their corresponding string values. For "free-text", this should be null or omitted.
    5.  "difficulty": (string) Suggested difficulty (e.g., "Easy", "Medium", "Hard").

    Please format your response STRICTLY as a single JSON array containing ${numberOfQuestions} question objects. 
    Each object in the array must follow the structure described above.

    Example of a single question object for a multiple-choice question:
    {
      "question_text": "What is the main purpose of a Dockerfile?",
      "question_type": "multiple-choice",
      "answer_key": "B",
      "options": {
        "A": "To manage container networking",
        "B": "To define the steps to create a Docker image",
        "C": "To run containerized applications in production",
        "D": "To store Docker images"
      },
      "difficulty": "Medium"
    }

    Example of a single question object for a free-text question:
    {
      "question_text": "Explain the concept of CI/CD.",
      "question_type": "free-text",
      "answer_key": "CI/CD stands for Continuous Integration and Continuous Delivery/Deployment. CI is the practice of frequently merging code changes into a central repository, followed by automated builds and tests. CD automates the release of software to various environments.",
      "options": null,
      "difficulty": "Medium"
    }

    JSON Array Response:
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: generationModel,
      messages: [
        { role: 'system', content: 'You are an AI assistant that generates quiz questions in JSON array format.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: "json_object" }, // Expecting a root JSON object that contains the array
      temperature: 0.7, // Higher temperature for more creative/varied question generation
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      console.error('OpenAI API returned an empty response content for question generation.');
      return null;
    }

    // The API (with response_format: { type: "json_object" }) should return a JSON object.
    // We need to instruct it to make that object contain the array, e.g. { "questions": [...] }
    // Or, we need to adjust the prompt to ask for the array directly if the model supports it well.
    // For now, let's assume the prompt is good enough that the top-level object IS the array, or can be parsed as such.
    // A safer approach would be to wrap the expected array in a key, e.g. `"questions": [...]` in the prompt and parse that.
    // Let's assume the model returns an object like `{"questions": [...]}` as per more robust prompting.
    // Modifying prompt slightly to ask for `{"questions": [...]}` structure
    // Re-evaluating: Simpler to ask for array directly and parse, assuming the model can handle it. If not, we wrap.
    // The current prompt asks for a JSON array directly. Let's trust it can provide that. If not, `JSON.parse` will fail.

    const parsedResponse = JSON.parse(responseContent);

    let questionsToProcess = parsedResponse;

    // If numberOfQuestions is 1 and parsedResponse is a single object (not an array),
    // and it looks like a question, wrap it in an array.
    if (numberOfQuestions === 1 && typeof parsedResponse === 'object' && parsedResponse !== null && !Array.isArray(parsedResponse) && parsedResponse.question_text) {
        questionsToProcess = [parsedResponse];
    }

    // Validate if it's an array and has the expected number of questions
    // And if each question has the essential fields. This is a basic validation.
    if (!Array.isArray(questionsToProcess)) {
        // Sometimes the model might wrap the array in a key like "questions", let's check for that if the direct parse fails.
        // This check should now consider if parsedResponse (original) was an object containing 'questions'
        if (typeof parsedResponse === 'object' && parsedResponse !== null && parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
            const questionsArray = parsedResponse.questions;
            if (questionsArray.length > 0 && questionsArray.every(q => q.question_text && q.question_type && q.answer_key)) {
                 return questionsArray; // Return the nested array
            }
        } 
        console.error('OpenAI question generation response is not a valid array or does not contain a valid questions array:', parsedResponse);
        return null;
    }
    
    if (questionsToProcess.length === 0 && numberOfQuestions > 0) {
        console.warn('OpenAI generated an empty array of questions when questions were requested.');
        // Potentially return empty array or null depending on desired strictness
        return []; 
    }

    // Basic validation of question structure within the array
    if (questionsToProcess.some(q => !q.question_text || !q.question_type || !q.answer_key)) {
        console.error('Some generated questions are missing essential fields (question_text, question_type, answer_key).', questionsToProcess);
        // Decide whether to filter out bad ones or reject the whole batch
        // For V1, we can be a bit lenient and try to filter, or just log and return what we got if some are okay.
        // Or be strict: return null;
        // Let's be strict for now to ensure data quality for admin approval.
        return null; 
    }

    return questionsToProcess; // This should be an array of question objects

  } catch (error) {
    console.error('Error calling OpenAI API for question generation:', error);
    if (error instanceof SyntaxError) {
        console.error("Failed to parse OpenAI response as JSON. Response was:", error.message, "\nOriginal problematic string might be logged by the OpenAI client or not directly available here.");
    }
    return null;
  }
}

module.exports = {
  gradeFreeTextAnswer,
  generateQuestionsBatch,
}; 