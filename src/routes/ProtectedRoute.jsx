// ProtectedRoute.js
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');



  if (!token || role !== 'admin') {
    // Clear any existing auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;