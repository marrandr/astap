import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import { useMemo, useState } from 'react';
import Home from './components/Home/Home.tsx';
import Login from './components/Login/Login.tsx';
import Signup from './components/Signup/Signup.tsx';
import EmailVerification from './components/EmailVerification/EmailVerification.tsx';
import CreatePost from './components/CreatePost/CreatePost.tsx';
import CreateSubPost from './components/CreateSubPost/CreateSubPost.tsx';
import AdminDashboard from './components/Admin/AdminDashboard.tsx';
import PublicOnlyRoute from './components/PublicOnlyRoute.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { AuthContext, getStoredToken, getTokenRole, setStoredToken, clearStoredToken } from './lib/auth';
import ArticleDetail from './components/ArticleDetail/ArticleDetail.tsx';
import ProfilePage from './components/Profile/Profile.tsx';

function App() {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const role = useMemo(() => getTokenRole(token), [token]);

  const authValue = useMemo(
    () => ({
      token,
      role,
      isAuthenticated: !!token,
      isAdmin: role === 'ADMIN',
      login: (newToken: string, remember = true) => {
        setStoredToken(newToken, remember);
        setToken(newToken);
      },
      logout: () => {
        clearStoredToken();
        setToken(null);
      },
    }),
    [token, role],
  );

  return (
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/articles/new" element={<CreatePost />} />
            <Route path="/articles/:id/sub-post/new" element={<CreateSubPost />} />
          </Route>

          <Route element={<PublicOnlyRoute />}>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Signup />} />
            <Route path="/auth/verify-email" element={<EmailVerification />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/validation" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
