import { useAuth } from '../contexts/AuthContext';
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '80vh',
      textAlign: 'center'
    }}>
      <Typography variant="h3" gutterBottom>
        Welcome to Quiz App
      </Typography>
      <Typography variant="h5" gutterBottom>
        {user ? `Hello, ${user.username}!` : 'Please login to continue'}
      </Typography>
      <Box sx={{ mt: 4 }}>
        {user ? (
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate(user.role === 'admin' ? '/admin' : '/user')}
          >
            Go to Dashboard
          </Button>
        ) : (
          <>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/login')}
              sx={{ mr: 2 }}
            >
              Login
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Home;