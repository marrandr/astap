import './Home.css';
import { Outlet } from 'react-router'

interface HomeProps {}

const Home = () => (
  <div className="Home">
	<Outlet />
  </div>
);

export default Home;
