import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EditQuiz = () => {
  const { quizName: encodedQuizName } = useParams();
  const quizName = decodeURIComponent(encodedQuizName);
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  useEffect(() => {
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const quizToEdit = quizzes.find(q => q.name === quizName);
    
    if (!quizToEdit) {
      setError('Quiz not found');
      setLoading(false);
      return;
    }
    
    setQuizData(quizToEdit);
    setLoading(false);
  }, [quizName]);

  const handleUpdateQuiz = (updatedQuestions) => {
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const updatedQuizzes = quizzes.map(q => 
      q.name === quizName ? { ...q, questions: updatedQuestions } : q
    );
    localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const handleEditQuestion = (index) => {
    const question = quizData.questions[index];
    setEditingQuestion(index);
    setEditFormData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.options.indexOf(question.correctAnswer)
    });
  };

  const handleSaveEdit = () => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[editingQuestion] = {
      question: editFormData.question,
      options: editFormData.options,
      correctAnswer: editFormData.options[editFormData.correctAnswer]
    };
    
    handleUpdateQuiz(updatedQuestions);
    setEditingQuestion(null);
  };

  const handleDeleteClick = (index) => {
    setQuestionToDelete(index);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteQuestion = () => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions.splice(questionToDelete, 1);
    handleUpdateQuiz(updatedQuestions);
    setDeleteConfirmOpen(false);
    setQuestionToDelete(null);
  };

  const handleAddQuestion = () => {
    setEditingQuestion('new');
    setEditFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  };

  const handleSaveNewQuestion = () => {
    const newQuestion = {
      question: editFormData.question,
      options: editFormData.options,
      correctAnswer: editFormData.options[editFormData.correctAnswer]
    };
    
    const updatedQuestions = [...quizData.questions, newQuestion];
    handleUpdateQuiz(updatedQuestions);
    setEditingQuestion(null);
  };

  const renderEditDialog = () => (
    <Dialog open={editingQuestion !== null} onClose={() => setEditingQuestion(null)} fullWidth maxWidth="md">
      <DialogTitle>
        {editingQuestion === 'new' ? 'Add New Question' : 'Edit Question'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Question"
          value={editFormData.question}
          onChange={(e) => setEditFormData({...editFormData, question: e.target.value})}
          sx={{ mb: 2, mt: 2 }}
        />
        
        {editFormData.options.map((option, i) => (
          <Box key={`option-${i}`} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TextField
              fullWidth
              label={`Option ${i + 1}`}
              value={option}
              onChange={(e) => {
                const newOptions = [...editFormData.options];
                newOptions[i] = e.target.value;
                setEditFormData({...editFormData, options: newOptions});
              }}
            />
            <IconButton
              color={editFormData.correctAnswer === i ? 'primary' : 'default'}
              onClick={() => setEditFormData({...editFormData, correctAnswer: i})}
              sx={{ ml: 1 }}
            >
              <CheckIcon />
            </IconButton>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditingQuestion(null)} startIcon={<CloseIcon />}>
          Cancel
        </Button>
        <Button 
          onClick={editingQuestion === 'new' ? handleSaveNewQuestion : handleSaveEdit} 
          startIcon={<SaveIcon />}
          variant="contained"
          disabled={!editFormData.question || editFormData.options.some(opt => !opt.trim())}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderDeleteConfirm = () => (
    <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this question?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
        <Button onClick={confirmDeleteQuestion} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderQuestionList = () => (
    quizData.questions.map((q, i) => (
      <Box 
        key={`question-${i}`}
        sx={{ 
          mb: 3, 
          p: 2, 
          border: '1px solid #eee', 
          borderRadius: 1,
          position: 'relative'
        }}
      >
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton onClick={() => handleEditQuestion(i)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteClick(i)} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
        
        <Typography fontWeight="bold">{i + 1}. {q.question}</Typography>
        <Box component="ul" sx={{ pl: 2, mt: 1, listStyleType: 'none' }}>
          {q.options.map((opt, j) => (
            <li 
              key={`question-${i}-option-${j}`}
              style={{ 
                color: opt === q.correctAnswer ? 'green' : 'inherit',
                fontWeight: opt === q.correctAnswer ? 'bold' : 'normal'
              }}
            >
              {String.fromCharCode(97 + j)}. {opt}
              {opt === q.correctAnswer && <CheckIcon sx={{ ml: 1, fontSize: '1rem' }} />}
            </li>
          ))}
        </Box>
      </Box>
    ))
  );

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Quizzes
      </Button>

      <Typography variant="h4" gutterBottom>
        Editing: {quizData.name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
        <Chip label={`Topic: ${quizData.topic}`} sx={{ mr: 1 }} />
        <Chip label={`Difficulty: ${quizData.difficulty}`} />
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Questions ({quizData.questions.length})
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleAddQuestion}
          startIcon={<EditIcon />}
        >
          Add Question
        </Button>
      </Box>
      
      {quizData.questions.length > 0 ? (
        renderQuestionList()
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No questions yet. Add your first question!
        </Typography>
      )}
      
      {renderEditDialog()}
      {renderDeleteConfirm()}
    </Box>
  );
};

export default EditQuiz;