// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './Homepage';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import DashboardPage from './pages/Dashboard';
import PlacesPage from './pages/PlacesPage';
import PlaceDetailsPage from './pages/PlaceDetailsPage';
import CreatePlacePage from './pages/CreatePlacePage';
import MyReviewsPage from './pages/MyReviewsPage';
import ProfilePage from './pages/ProfilePage';
import { useAuthStore } from './store/authStore';

function App() {
  const { token, checkAuth, loading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const isAuthenticated = !!token;

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsInitializing(false);
    };
    initAuth();
  }, [checkAuth]);

  // Protected Route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isInitializing || loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <LoginPage />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <RegisterPage />
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/my-reviews" element={
            <ProtectedRoute>
              <MyReviewsPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/create-place" element={
            <ProtectedRoute>
              <CreatePlacePage />
            </ProtectedRoute>
          } />
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/places/:id" element={<PlaceDetailsPage />} />
          <Route path="/search" element={<PlacesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;