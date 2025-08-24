import { useEffect, useState } from 'react';
import { useQuiz } from '../../contexts/QuizContext';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  CircularProgress,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import localforage from 'localforage';
import DeleteIcon from '@mui/icons-material/Delete';

const TestHistory = () => {
  const { testResults, setTestResults } = useQuiz();
  const [sortedResults, setSortedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  // Load results from localforage
  const loadResults = async () => {
    try {
      const results = await localforage.getItem('testResults') || [];
      setTestResults(results);
      setLoading(false);
    } catch (err) {
      console.error('Error loading test results:', err);
      setError('Failed to load test results');
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadResults();
  }, []);

  // Sort results whenever they change
  useEffect(() => {
    const sorted = [...testResults].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    setSortedResults(sorted);
  }, [testResults]);

  const viewResultDetails = (result) => {
    navigate('/user/results', { state: { result } });
  };

  const deleteResult = async (resultToDelete) => {
    try {
      // Use a unique identifier for comparison (date + quizName as fallback)
      const updatedResults = testResults.filter(result => 
        result.id ? result.id !== resultToDelete.id : 
        result.date !== resultToDelete.date || 
        result.quizName !== resultToDelete.quizName
      );

      await localforage.setItem('testResults', updatedResults);
      setTestResults(updatedResults);

      setSnackbarMessage('Result deleted successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error deleting test result:', err);
      setError('Failed to delete test result');
      setSnackbarMessage('Error deleting result');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Test History
      </Typography>

      {sortedResults.length === 0 ? (
        <Typography variant="body1">No test results available yet.</Typography>
      ) : (
        <>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Quiz Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Topic</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Difficulty</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedResults.map((result, index) => (
                  <TableRow 
                    key={index}
                    sx={{ '&:hover': { backgroundColor: '#fafafa' } }}
                  >
                    <TableCell>{new Date(result.date).toLocaleString()}</TableCell>
                    <TableCell>{result.quizName || 'Untitled Quiz'}</TableCell>
                    <TableCell>{result.topic}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {result.difficulty}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          {result.score} / {result.total}
                          <Box sx={{ 
                            height: 4,
                            backgroundColor: '#e0e0e0',
                            borderRadius: 2,
                            mt: 0.5
                          }}>
                            <Box sx={{
                              width: `${(result.score / result.total) * 100}%`,
                              height: '100%',
                              backgroundColor: 
                                (result.score / result.total) > 0.7 ? '#4caf50' :
                                (result.score / result.total) > 0.4 ? '#ffc107' : '#f44336',
                              borderRadius: 2
                            }} />
                          </Box>
                        </Box>
                        ({Math.round((result.score / result.total) * 100)}%)
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => viewResultDetails(result)}
                          sx={{ textTransform: 'none' }}
                        >
                          View Details
                        </Button>
                        <IconButton
                          aria-label="delete"
                          onClick={() => deleteResult(result)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleSnackbarClose} severity={error ? 'error' : 'success'}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default TestHistory;