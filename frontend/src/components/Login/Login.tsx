import './Login.css';
import account from '../../assets/new_account.png';
import Input from '../Input/Input';
import LoginSeparator from '../LoginSeparator/LoginSeparator';
import { useNavigate } from 'react-router';

interface SignUp {
	src : string;
	size : number;
	children : string;
}

const SignUp = ({src, size, children} : SignUp) => {
	
	const navigate = useNavigate();
	
	return (
		<div onClick={ () => { navigate("/signup"); }} className='ContinueGoogle'>
			<img src={src} width={size} height={ size } />
			<p>{ children }</p>
		</div>
	)
}

const Login = () => (
  <form className="Login">
	<div className='LoginLeft'>
	</div>
	<div className='LoginRight'>
		<p className='title'>Se connecter</p>
		<Input icon={ null } name='email' type='email' holder='Saisissez votre adresse e-mail'>E-mail</Input>
		<Input icon={ null } name='email' type='password' holder='Saisissez votre mot de passe'>Mot de passe</Input>
		<button>continuer</button>
		<LoginSeparator>ou</LoginSeparator>
		<SignUp size={20} src={account}>S'incrire</SignUp>
	</div>
  </form>
);

export default Login;
