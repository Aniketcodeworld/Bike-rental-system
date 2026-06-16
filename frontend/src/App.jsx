import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import BikesPage from './pages/BikesPage';
import BikeDetailPage from './pages/BikeDetailPage';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import { useAuth } from './context/AuthContext';

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

const AdminOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/bikes" element={<BikesPage />} />
        <Route path="/bikes/:id" element={<BikeDetailPage />} />
        <Route path="/bookings" element={<Protected><BookingsPage /></Protected>} />
        <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
        <Route path="/admin" element={<AdminOnly><AdminPage /></AdminOnly>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}