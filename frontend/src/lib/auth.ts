import { loggedIn, loggedOut } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getTokenRole } from './authStorage';
export { getStoredToken, getTokenRole, clearStoredToken, setStoredToken, getPendingEmail, setPendingEmail, clearPendingEmail } from './authStorage';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { token, role } = useAppSelector((state) => state.auth);
  return {
    token, role, isAuthenticated: !!token && role !== null, isAdmin: role === 'ADMIN',
    login: (newToken: string, remember = true) => dispatch(loggedIn({ token: newToken, remember })),
    logout: () => dispatch(loggedOut()),
  };
}
export function getStoredUserRole() { const token = localStorage.getItem('astap_access_token') ?? sessionStorage.getItem('astap_access_token'); return getTokenRole(token); }
