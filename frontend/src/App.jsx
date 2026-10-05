import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/shared/ErrorBoundary';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Syllabus from './pages/Syllabus';
import Progress from './pages/Progress';
import Insights from './pages/Insights';
import Reports from './pages/Reports';
import StudyRooms from './pages/StudyRooms';
import StudyRoom from './pages/StudyRoom';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/syllabus" element={<Syllabus />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/rooms" element={<StudyRooms />} />
            <Route path="/rooms/:roomId" element={<StudyRoom />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}