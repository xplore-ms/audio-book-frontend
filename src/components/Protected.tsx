import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import type { JSX } from 'react';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, authChecked } = useUser();
  const location = useLocation();

  if (!authChecked) {
    return null; // or loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  return children;
}
