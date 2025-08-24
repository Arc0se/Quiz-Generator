import { useState, useEffect } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  CircularProgress,
  Alert,
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Paper
} from '@mui/material';
import localforage from 'localforage';
import {
  Timer as TimerIcon,
  Help as HelpIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Send as SendIcon,
  FormatListNumbered as FormatListNumberedIcon
} from '@mui/icons-material';

const Quiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuizzes = () => {
      try {
        const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        setQuizzes(savedQuizzes);
        if (savedQuizzes.length === 0) {
          setError('No quizzes found. Please create a quiz first.');
        }
      } catch (err) {
        setError('Failed to load quizzes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  useEffect(() => {
    if (!selectedQuiz || !timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedQuiz, timeLeft]);

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedOptions([]);
    setTimeLeft(quiz.questions.length * 60);
  };

  const handleOptionSelect = (questionIndex, optionIndex) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[questionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  const handleNext = () => {
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedQuiz) return;
    
    if (selectedOptions.length !== selectedQuiz.questions.length) {
      setError('Please answer all questions');
      return;
    }

    const score = selectedQuiz.questions.reduce((acc, question, index) => {
      const isCorrect = selectedOptions[index] === question.options.indexOf(question.correctAnswer);
      return acc + (isCorrect ? 1 : 0);
    }, 0);

    const result = {
      quizId: selectedQuiz.id,
      quizName: selectedQuiz.name,
      date: new Date().toISOString(),
      score,
      total: selectedQuiz.questions.length,
      topic: selectedQuiz.topic,
      difficulty: selectedQuiz.difficulty,
      answers: selectedQuiz.questions.map((q, i) => ({
        question: q.question,
        selected: q.options[selectedOptions[i]],
        correct: q.correctAnswer,
        isCorrect: selectedOptions[i] === q.options.indexOf(q.correctAnswer)
      }))
    };

    const existingResults = await localforage.getItem('testResults') || [];
    await localforage.setItem('testResults', [...existingResults, result]);
    
    setSelectedQuiz(null);
  };

  const returnToQuizList = () => {
    setSelectedQuiz(null);
    setError('');
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !selectedQuiz) {
    return (
      <Card sx={{ 
        maxWidth: 500, 
        mx: 'auto', 
        mt: 10, 
        p: 3,
        textAlign: 'center'
      }}>
        <CardContent>
          <Alert 
            severity="error"
            sx={{ mb: 3 }}
            icon={<HelpIcon fontSize="large" />}
          >
            <Typography variant="h6">{error}</Typography>
          </Alert>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => window.location.href = '/create-quiz'}
            sx={{ mt: 2 }}
          >
            Create New Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (selectedQuiz) {
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;
    
    return (
      <Paper elevation={3} sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        p: 4,
        borderRadius: 3
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {selectedQuiz.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip label={selectedQuiz.topic} size="small" />
              <Chip label={selectedQuiz.difficulty} size="small" color="secondary" />
            </Box>
          </Box>
          
          <Chip
            icon={<TimerIcon />}
            label={`Time: ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}
            color={timeLeft < 60 ? 'error' : 'primary'}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 8, borderRadius: 4, mb: 3 }}
        />

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
        </Typography>
        
        <Card variant="outlined" sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="medium">
              {currentQuestion.question}
            </Typography>
          </CardContent>
        </Card>

        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={selectedOptions[currentQuestionIndex] ?? ''}
            onChange={(e) => handleOptionSelect(currentQuestionIndex, parseInt(e.target.value))}
          >
            {currentQuestion.options.map((option, index) => (
              <Card 
                key={index}
                variant="outlined"
                sx={{ 
                  mb: 1,
                  borderRadius: 2,
                  borderColor: selectedOptions[currentQuestionIndex] === index ? 'primary.main' : 'divider',
                  bgcolor: selectedOptions[currentQuestionIndex] === index ? 'primary.light' : 'background.paper'
                }}
              >
                <FormControlLabel
                  value={index}
                  control={<Radio color="primary" />}
                  label={
                    <Typography variant="body1">
                      {option}
                    </Typography>
                  }
                  sx={{ 
                    width: '100%',
                    m: 0,
                    p: 1.5,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                />
              </Card>
            ))}
          </RadioGroup>
        </FormControl>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 4,
          gap: 2
        }}>
          <Button
            variant="outlined"
            onClick={returnToQuizList}
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 2 }}
          >
            Quiz List
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: 2 }}
            >
              Previous
            </Button>
            
            {currentQuestionIndex < selectedQuiz.questions.length - 1 ? (
              <Button 
                variant="contained" 
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: 2 }}
              >
                Next
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="success" 
                onClick={handleSubmit}
                endIcon={<SendIcon />}
                sx={{ borderRadius: 2 }}
              >
                Submit Quiz
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Available Quizzes
      </Typography>
      
      {quizzes.length === 0 ? (
        <Card variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No quizzes available yet.</Typography>
        </Card>
      ) : (
        <Card variant="outlined">
          <List sx={{ width: '100%' }}>
            {quizzes.map((quiz, index) => (
              <Box key={quiz.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" fontWeight="medium">
                        {quiz.name}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip label={quiz.topic} size="small" />
                          <Chip label={quiz.difficulty} size="small" color="secondary" />
                          <Chip 
                            icon={<FormatListNumberedIcon />}
                            label={`${quiz.questions.length} Qs`} 
                            size="small" 
                          />
                        </Box>
                      </>
                    }
                  />
                  <Button 
                    variant="contained" 
                    onClick={() => startQuiz(quiz)}
                    sx={{ 
                      ml: 2,
                      borderRadius: 2,
                      px: 3
                    }}
                  >
                    Start
                  </Button>
                </ListItem>
                {index < quizzes.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
};

export default Quiz;