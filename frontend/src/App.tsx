import './App.css';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router';
import Home from './components/Home/Home.tsx';
import Login from './components/Login/Login.tsx';
import Signup from './components/Signup/Signup.tsx';
import EmailVerification from './components/EmailVerification/EmailVerification.tsx';
import CreatePost from './components/CreatePost/CreatePost.tsx';
import CreateSubPost from './components/CreateSubPost/CreateSubPost.tsx';
import AdminDashboard from './components/Admin/AdminDashboard.tsx';
import AdminRoute from './components/AdminRoute.tsx';
import NewsWatch from './components/Admin/NewsWatch.tsx';
import PublicOnlyRoute from './components/PublicOnlyRoute.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import ArticleDetail from './components/ArticleDetail/ArticleDetail.tsx';
import ProfilePage from './components/Profile/Profile.tsx';
import PublicNewsWatch from './components/PublicNewsWatch/PublicNewsWatch.tsx';
import ImageVerification from './components/ImageVerification/ImageVerification.tsx';
import Navbar from './components/SiteNavbar.tsx';

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<div className='MainContent'><Navbar /><div className='Maincontent'><Outlet /></div></div>}>
              <Route path="/" element={<PublicNewsWatch />} />
              <Route path="/veille" element={<Navigate to="/" replace />} />
              <Route path="/verification" element={<Home />} />
              <Route path="/verification-resource" element={<ImageVerification />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/articles/:id" element={<ArticleDetail />} />
              <Route path="/articles/new" element={<CreatePost />} />
              <Route path="/articles/:id/sub-post/new" element={<CreateSubPost />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/validation" element={<AdminDashboard />} />
                <Route path="/admin/watch" element={<NewsWatch />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>

          <Route element={<PublicOnlyRoute />}>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Signup />} />
            <Route path="/auth/verify-email" element={<EmailVerification />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
