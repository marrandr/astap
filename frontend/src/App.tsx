import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { useMemo, useState } from 'react';
import Home from './components/Home/Home.tsx';
import Login from './components/Login/Login.tsx';
import Signup from './components/Signup/Signup.tsx';
import EmailVerification from './components/EmailVerification/EmailVerification';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { AuthContext, clearStoredToken, getStoredToken, setStoredToken } from './lib/auth';

function App() {
  const [token, setToken] = useState<string | null>(getStoredToken());

  const authValue = useMemo(
    () => ({
      token,
      isAuthenticated: !!token,
      login: (newToken: string) => {
        setStoredToken(newToken);
        setToken(newToken);
      },
      logout: () => {
        clearStoredToken();
        setToken(null);
      },
    }),
    [token],
  );

  return (
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>

          <Route element={<PublicOnlyRoute />}>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Signup />} />
            <Route path="/auth/verify-email" element={<EmailVerification />} />
          </Route>

          <Route path="*" element={<Navigate to={token ? '/' : '/auth/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
