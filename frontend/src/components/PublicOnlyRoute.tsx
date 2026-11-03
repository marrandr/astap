import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../lib/auth';

export default function PublicOnlyRoute() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/verification'} replace />;
  }

  return <Outlet />;
}
