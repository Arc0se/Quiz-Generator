import { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import CreateQuiz from './CreateQuiz';
import ViewQuizzes from './viewQuizzes';

const AdminDashboard = () => {
  const [value, setValue] = useState(0);

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={value} onChange={(e, newValue) => setValue(newValue)}>
        <Tab label="CREATE QUIZ" />
        <Tab label="VIEW QUIZZES" />
      </Tabs>
      {value === 0 && <CreateQuiz />}
      {value === 1 && <ViewQuizzes />}
    </Box>
  );
};

export default AdminDashboard;