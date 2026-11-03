import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getStoredToken, getTokenRole, setStoredToken, clearStoredToken } from '../lib/authStorage';

type Role = 'ADMIN' | 'PERSONAL' | null;
interface AuthState { token: string | null; role: Role }
const initialToken = getStoredToken();
const initialState: AuthState = { token: initialToken, role: getTokenRole(initialToken) };

const authSlice = createSlice({
  name: 'auth', initialState,
  reducers: {
    loggedIn(state, action: PayloadAction<{ token: string; remember?: boolean }>) {
      setStoredToken(action.payload.token, action.payload.remember);
      state.token = action.payload.token;
      state.role = getTokenRole(action.payload.token);
    },
    loggedOut(state) { clearStoredToken(); state.token = null; state.role = null; },
  },
});
export const { loggedIn, loggedOut } = authSlice.actions;
export default authSlice.reducer;
