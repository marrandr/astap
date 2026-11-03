import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router';
import { useMemo, useState } from 'react';
import Home from './components/Home/Home.tsx';
import Login from './components/Login/Login.tsx';
import Signup from './components/Signup/Signup.tsx';
import CreatePost from './components/CreatePost/CreatePost.tsx';
import CreateSubPost from './components/CreateSubPost/CreateSubPost.tsx';
import ArticleDetail from './components/ArticleDetail/ArticleDetail.tsx';
import EmailVerification from './components/EmailVerification/EmailVerification.tsx';
import AdminDashboard from './components/Admin/AdminDashboard.tsx';
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
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/articles/new" element={<CreatePost />} />
            <Route path="/articles/:id/sub-post/new" element={<CreateSubPost />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<PublicOnlyRoute />}>
            <Route path="/auth">
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Signup />} />
              <Route path="verify-email" element={<EmailVerification />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
