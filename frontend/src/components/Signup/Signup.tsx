import './Signup.css';
import user from '../../assets/user.png';
import email from '../../assets/email.png';
import password from '../../assets/password.png';
import check from '../../assets/check.png';
import arrow from '../../assets/right-arrow.png';
import Input from '../Input/Input';
import verso from '../../assets/verso.svg';
import recto from '../../assets/recto.svg';
import { Children } from 'react';

interface SignUp {
	src : string;
	size : number;
	otherClass: string;
	children : string;
}

const Finish = ({src, size, otherClass, children} : SignUp) => {
	return (
		<div className={'Finish ' + otherClass}>
			<p>{ children }</p>
			<img src={src} width={size} height={ size } />
		</div>
	)
}

interface AddCardItemProps {
	classList: string;
	icon: string;
	size: number;
	children: string;
	name: string;
}

const AddCardItem =({classList, icon, size, children, name} : AddCardItemProps) => {
	
	return (
		<div className={'AddCardItem ' + classList}>
			<div>
				<img src={icon} width={size} height={size} />
			</div>
			<p>{children}</p>
			<label>
				<input id={name} name={name} style={{display : 'none'}} type='file' />
				importer
			</label>
		</div>
	)
}

const AddCard = () => {
	return (
		<div className='AddCard'>
			<AddCardItem icon={verso} size={24} name='versocard' classList='left'>Recto de la carte</AddCardItem>
			<AddCardItem icon={recto} size={24} name='rectocard' classList='right'>Verso de la carte</AddCardItem>
		</div>
	);
}

const Signup = () => (
  <form className="Signup">
	<div className='SignupLeft'>
	</div>
	<div className='SignupRight'>
		<p className='title'>Créer un compte</p>
		<Input icon={ user } name='username' type='text' holder='Saisissez votre nom et prénom'>Nom et prénom</Input>
		<Input icon={ email } name='username' type='email' holder='Saisissez votre adresse e-mail'>Adresse email</Input>
		<Input icon={ password } name='email' type='password' holder='Saisissez votre mot de passe'>Mot de passe</Input>
		<Input icon={ check } name='email' type='password' holder='Confirmez votre mot de passe'>Confirmer le mot de passe</Input>
		<AddCard />
		<Finish otherClass='BackgroundGrey' size={10} src={arrow}>Créer mon compte</Finish>
	</div>
  </form>
);

export default Signup;
