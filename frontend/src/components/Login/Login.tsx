import './Login.css';
import Google from '../../assets/new_account.png';
import Input from '../Input/Input';


interface Text {
	children : string
}

interface SignUp {
	src : string;
	size : number;
	children : string;
}

const SignUp = ({src, size, children} : SignUp) => {
	return (
		<div className='ContinueGoogle'>
			<img src={src} width={size} height={ size } />
			<p>{ children }</p>
		</div>
	)
}

const LoginSeparator = ({children} : Text) => (
    <div className='LoginSeparator'>
      <div></div>
      <p>{children}</p>
      <div></div>
    </div>
)


const Login = () => (
  <div className="Login">
	<div className='LoginLeft'>
	</div>
	<div className='LoginRight'>
		<p className='title'>Se connecter</p>
		<Input name='email' type='email' holder='Saisissez votre adresse e-mail'>E-mail</Input>
		<Input name='email' type='password' holder='Saisissez votre mot de passe'>Mot de passe</Input>
		<button>continuer</button>
		<LoginSeparator>ou</LoginSeparator>
		<SignUp size={20} src={Google}>S'incrire</SignUp>
	</div>
  </div>
);

export default Login;
