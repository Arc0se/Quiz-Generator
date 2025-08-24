import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../../contexts/QuizContext';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  MenuItem, 
  Alert,
  Paper,
  Stack,
  CircularProgress
} from '@mui/material';

const UserDashboard = () => {
  const [topic, setTopic] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [error, setError] = useState('');
  const { fetchQuestions, loading } = useQuiz();
  const navigate = useNavigate();
  const handleStartQuiz = async () => {
    try {
      await fetchQuestions(topic === 'all' ? null : topic, difficulty === 'all' ? null : difficulty);
      navigate('/user/quiz');
    } catch (err) {
      setError('Failed to load questions. Please try again.');
    }
  };

  return (
    <Box sx={{ 
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '60vh',
      justifyContent: 'center'
    }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        width: '100%', 
        maxWidth: '600px',
        borderRadius: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            mb: 3,
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          Welcome to Quiz App
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>  
          <Button
            variant="contained"
            size="large"
            onClick={handleStartQuiz}
            disabled={loading}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: 1
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'BROWSE AVAILABLE QUIZZES'
            )}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default UserDashboard;