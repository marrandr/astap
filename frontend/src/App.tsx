import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router';
import Home from './components/Home/Home.tsx';
import Login from './components/Login/Login.tsx'

function App() {
  return (
    <BrowserRouter>
		<Routes>
			<Route path="/" element={<Home />}>
				<Route path="login" element={<Login />} />
			</Route>
		</Routes>
    </BrowserRouter>
  )
}

export default App
