import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { useMemo, useState } from 'react';
import Home from './components/Home/Home.tsx';
import Login from './components/Login/Login.tsx';
import Signup from './components/Signup/Signup.tsx';
import CreatePost from './components/CreatePost/CreatePost.tsx';
import CreateSubPost from './components/CreateSubPost/CreateSubPost.tsx';

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
    <BrowserRouter>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/articles/new" element={<CreatePost />} />
			<Route path="/articles/:id/sub-post/new" element={<CreateSubPost />} />
			<Route path='auth'>
				<Route path="login" element={<Login />} />
				<Route path="register" element={<Signup />} />
			</Route>
		</Routes>
    </BrowserRouter>
  )
}

export default App;
