import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl,
  Typography,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Divider,
  Chip,
  Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const CreateQuiz = () => {
  const [quizData, setQuizData] = useState({
    name: '',
    topic: '',
    difficulty: 'medium',
    questionCount: 5
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wikipediaText, setWikipediaText] = useState('');
  const [showWikipedia, setShowWikipedia] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchWikipedia = async (topic) => {
    const endpoint = "https://en.wikipedia.org/w/api.php";
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      prop: "extracts",
      exintro: true,
      explaintext: true,
      titles: topic,
      origin: "*"
    });

    try {
      const response = await fetch(`${endpoint}?${params}`);
      if (!response.ok) throw new Error(`Wikipedia API returned ${response.status}`);
      
      const data = await response.json();
      const pages = data.query.pages;
      
      for (const pageId in pages) {
        if (pages[pageId].extract) {
          return pages[pageId].extract;
        }
      }
      return "No extract found for this topic.";
    } catch (error) {
      console.error("Wikipedia fetch error:", error);
      return `Error fetching data: ${error.message}`;
    }
  };

  const buildPrompt = (topic, difficulty, count, context = null) => {
    return `Generate exactly ${count} multiple-choice questions based on:
${context ? `Context:\n${context.substring(0, 2000)}\n\n` : ''}
Topic: ${topic}
Difficulty: ${difficulty}

Format each as: ["question", ["option1", "option2", "option3", "option4"], correctIndex]
Only return a valid JSON array, no other text or markdown.`;
  };

  const handleGenerateQuestions = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setGeneratedQuestions([]);

      if (!quizData.topic.trim()) throw new Error('Please enter a topic');
      const count = Math.max(1, Math.min(20, quizData.questionCount));

      let wikiContext = '';
      try {
        wikiContext = await fetchWikipedia(quizData.topic);
        if (wikiContext && !wikiContext.startsWith('Error')) {
          setWikipediaText(wikiContext);
          setShowWikipedia(true);
        }
      } catch (wikiError) {
        console.log("Proceeding without Wikipedia context", wikiError);
      }

      const prompt = buildPrompt(
        quizData.topic,
        quizData.difficulty,
        count,
        wikiContext.startsWith('Error') ? null : wikiContext
      );

      const response = await fetch('http://localhost:5000/api/generate-mcqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, count })
      });

      if (!response.ok) throw new Error(await response.text());
      
      const result = await response.json();
      const questions = Array.isArray(result) ? result : 
                       Array.isArray(result?.mcqs) ? result.mcqs : 
                       [];

      setGeneratedQuestions(
        questions.map(q => ({
          question: q[0] || 'No question text',
          options: Array.isArray(q[1]) ? q[1] : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: q[1]?.[q[2]] || q[1]?.[0] || 'Option 1',
          status: 'pending' // 'pending', 'accepted', or 'rejected'
        }))
      );

    } catch (err) {
      setError(err.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionStatus = (index, status) => {
    const updatedQuestions = [...generatedQuestions];
    updatedQuestions[index].status = status;
    setGeneratedQuestions(updatedQuestions);
  };

  const handleAddQuiz = () => {
    try {
      if (!quizData.name.trim()) throw new Error('Quiz name is required');
      
      // Filter only accepted questions
      const acceptedQuestions = generatedQuestions.filter(q => q.status === 'accepted');
      if (acceptedQuestions.length === 0) throw new Error('No accepted questions to save');

      const newQuiz = {
        id: Date.now().toString(),
        ...quizData,
        questions: acceptedQuestions,
        createdAt: new Date().toISOString()
      };

      const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      localStorage.setItem('quizzes', JSON.stringify([...existingQuizzes, newQuiz]));

      setSnackbarMessage(`Quiz saved with ${acceptedQuestions.length} questions!`);
      setSnackbarOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    setQuizData({
      name: '',
      topic: '',
      difficulty: 'medium',
      questionCount: 5
    });
    setGeneratedQuestions([]);
    setWikipediaText('');
    setShowWikipedia(false);
    setError(null);
  };

  const renderWikipediaPanel = () => (
    <Collapse in={showWikipedia}>
      <Box sx={{ p: 2, mb: 3, border: '1px solid #ddd', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">
            <Chip label="Context" color="info" sx={{ mr: 1 }} />
            Wikipedia Content
          </Typography>
          <IconButton size="small" onClick={() => setShowWikipedia(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
          {wikipediaText.length > 500 ? `${wikipediaText.substring(0, 500)}...` : wikipediaText}
        </Typography>
      </Box>
    </Collapse>
  );

  const renderQuestions = () => (
    generatedQuestions.map((q, i) => (
      <Box 
        key={i} 
        sx={{ 
          mb: 3, 
          p: 2, 
          border: '1px solid #eee', 
          borderRadius: 1,
          backgroundColor: q.status === 'accepted' ? '#f0fff0' : 
                          q.status === 'rejected' ? '#fff0f0' : 'inherit'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight="bold">{i + 1}. {q.question}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              color="success"
              onClick={() => handleQuestionStatus(i, 'accepted')}
              sx={{ 
                backgroundColor: q.status === 'accepted' ? '#4caf50' : 'inherit',
                color: q.status === 'accepted' ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: '#4caf50',
                  color: 'white'
                }
              }}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleQuestionStatus(i, 'rejected')}
              sx={{ 
                backgroundColor: q.status === 'rejected' ? '#f44336' : 'inherit',
                color: q.status === 'rejected' ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: '#f44336',
                  color: 'white'
                }
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Box component="ul" sx={{ pl: 2, mt: 1, listStyleType: 'none' }}>
          {q.options.map((opt, j) => (
            <li 
              key={j}
              style={{ 
                color: opt === q.correctAnswer ? 'green' : 'inherit',
                fontWeight: opt === q.correctAnswer ? 'bold' : 'normal'
              }}
            >
              {String.fromCharCode(97 + j)}. {opt}
            </li>
          ))}
        </Box>
        {q.status !== 'pending' && (
          <Typography 
            variant="caption" 
            color={q.status === 'accepted' ? 'success.main' : 'error.main'}
            sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
          >
            {q.status === 'accepted' ? <CheckIcon fontSize="small" sx={{ mr: 0.5 }} /> : 
             <ClearIcon fontSize="small" sx={{ mr: 0.5 }} />}
            {q.status.toUpperCase()}
          </Typography>
        )}
      </Box>
    ))
  );

  const acceptedCount = generatedQuestions.filter(q => q.status === 'accepted').length;

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Quiz Generator
      </Typography>

      <Box component="form" onSubmit={handleGenerateQuestions} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Quiz Name"
          value={quizData.name}
          onChange={(e) => setQuizData({...quizData, name: e.target.value})}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Topic"
            value={quizData.topic}
            onChange={(e) => setQuizData({...quizData, topic: e.target.value})}
            required
          />

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={quizData.difficulty}
              onChange={(e) => setQuizData({...quizData, difficulty: e.target.value})}
              label="Difficulty"
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Questions"
            type="number"
            inputProps={{ min: 1, max: 40 }}
            value={quizData.questionCount}
            onChange={(e) => setQuizData({
              ...quizData,
              questionCount: Math.min(40, Math.max(1, parseInt(e.target.value) || 5))
            })}
            sx={{ width: 120 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            type="submit"
            disabled={loading || !quizData.topic.trim()}
            startIcon={loading ? <CircularProgress size={40} /> : null}
          >
            {loading ? 'Generating...' : 'Generate Questions'}
          </Button>

          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>
        </Box>
      </Box>

      {renderWikipediaPanel()}

      {generatedQuestions.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h5">
              Generated Questions ({acceptedCount}/{generatedQuestions.length} accepted)
            </Typography>
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleAddQuiz}
              disabled={!quizData.name.trim() || acceptedCount === 0}
            >
              Save Quiz
            </Button>
          </Box>
          {renderQuestions()}
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default CreateQuiz;