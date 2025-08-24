import { createContext, useContext, useState, useEffect } from 'react';
import { getQuestions } from '../services/quiz';
import { saveTestResult } from '../utils/storage';
import localforage from 'localforage';

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTestResults = async () => {
      const results = await localforage.getItem('testResults') || [];
      setTestResults(results);
    };
    loadTestResults();
  }, []);

  const fetchQuestions = async (topic, difficulty) => {
    setLoading(true);
    try {
      const fetchedQuestions = await getQuestions(topic, difficulty);
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTestResult = async (result) => {
    const updatedResults = [...testResults, result];
    setTestResults(updatedResults);
    await localforage.setItem('testResults', updatedResults);
  };

  return (
    <QuizContext.Provider value={{
      questions,
      setQuestions,
      testResults,
      setTestResults, // Added this line
      fetchQuestions,
      addTestResult,
      loading
    }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};