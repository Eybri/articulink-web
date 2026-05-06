// src/components/PrivateRoute.jsx
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, getUser, isAdmin } from '../api/api';

const PrivateRoute = ({ children }) => {
  const token = getToken();
  const user = getUser();
  
  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!token || !user || !isAdmin()) {
      console.warn('Access denied: Invalid token or non-admin user');
    }
  }, [token, user]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/login?error=admin_required" replace />;
  }

  return children;
};

export default PrivateRoute;