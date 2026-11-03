import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router';
import Home from './components/Home/Home.tsx';
import Login from './components/Login/Login.tsx'
import Signup from './components/Signup/Signup.tsx';
import CreatePost from './components/CreatePost/CreatePost.tsx';
import CreateSubPost from './components/CreateSubPost/CreateSubPost.tsx';

function App() {
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

export default App
