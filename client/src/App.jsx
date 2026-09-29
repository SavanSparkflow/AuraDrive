import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout & Pages
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Starred from './pages/Starred';
import Recent from './pages/Recent';
import Trash from './pages/Trash';
import Profile from './pages/Profile';
import SharedView from './pages/SharedView';
import NotFound from './pages/NotFound';

// Public Marketing & Legal Pages
import FeaturesPage from './pages/public/FeaturesPage';
import PricingPage from './pages/public/PricingPage';
import SecurityPage from './pages/public/SecurityPage';
import HelpFAQPage from './pages/public/HelpFAQPage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Public-only Route for Auth pages
function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const { fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [fetchMe, token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Marketing Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/faq" element={<HelpFAQPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* Public Share Link Viewer */}
        <Route path="/share/:shareToken" element={<SharedView />} />

        {/* Protected Drive Application Layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/drive/folder/:folderId" element={<Dashboard />} />
          <Route path="/starred" element={<Starred />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
