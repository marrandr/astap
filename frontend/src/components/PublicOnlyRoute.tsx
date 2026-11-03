import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../lib/auth';

export default function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
