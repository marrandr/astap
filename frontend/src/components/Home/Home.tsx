import './Home.css';
import { Outlet } from 'react-router'


const Home = () => (
  <div className="Home">
	<Outlet />
  </div>
);

export default Home;
