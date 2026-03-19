import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import JobsPage from './pages/JobsPage';
import EventsPage from './pages/EventsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MessagesPage from './pages/MessagesPage';
import ProjectsPage from './pages/ProjectsPage';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-wrap" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <span>Loading DECP…</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — must be logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/"       element={<FeedPage />} />
          <Route path="/feed"   element={<FeedPage />} />
          <Route path="/jobs"   element={<JobsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
