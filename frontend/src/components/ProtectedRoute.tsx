import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../lib/auth';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
