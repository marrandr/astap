import './Login.css';
import Google from './Google.svg';

interface InputProps {
	name : string;
	children : string;
	type : string;
	buttonText : string
	holder: string
}

interface Text {
	children : string
}

interface ContinueGoogleProps {
	src : string;
	size : number;
	children : string;
}

const ContinueGoogle = ({src, size, children} : ContinueGoogleProps) => {
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

const Input = ({name, children, type, buttonText, holder} : InputProps) => {
  
  return (
    <div className='Input'>
      <label htmlFor={name}>{ children }</label>
      <input type={type} id={name} name={name} placeholder={ holder } />
      <button>{buttonText}</button>
    </div>
  )
}

const Login = () => (
  <div className="Login">
    <Input name='email' type='email' buttonText='continuer' holder='Saisissez votre adresse e-mail'>Se connecter</Input>
	<LoginSeparator>ou</LoginSeparator>
	<ContinueGoogle size={20} src={Google}>Continuer avec google</ContinueGoogle>
  </div>
);

export default Login;
