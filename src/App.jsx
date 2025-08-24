import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QuizProvider } from './contexts/QuizContext';
import Navbar from './components/common/Navbar';
import Home from './pages/home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import Quiz from './components/user/Quiz';
import Results from './components/user/Results';
import TestHistory from './components/user/TestHistory';
import EditQuiz from './components/admin/EditQuiz';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <QuizProvider>
          <div className="app">
            <Navbar />
            <div className="container">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route
                  path="/edit-quiz/:quizName"  // Note: This matches your original URL structure
                  element={
                    <ProtectedRoute role="admin">
                      <EditQuiz />
                    </ProtectedRoute>
                  }
                />

                {/* User Routes */}
                <Route path="/user" element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/user/quiz" element={
                  <ProtectedRoute>
                    <Quiz />
                  </ProtectedRoute>
                } />
                <Route path="/user/results" element={
                  <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                } />
                <Route path="/user/history" element={
                  <ProtectedRoute>
                    <TestHistory />
                  </ProtectedRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </QuizProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;