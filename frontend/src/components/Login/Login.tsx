import './Login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import account from '../../assets/new_account.png';
import Input from '../Input/Input';
import LoginSeparator from '../LoginSeparator/LoginSeparator';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

interface SignUp {
  src: string;
  size: number;
  children: string;
}

const SignUp = ({ src, size, children }: SignUp) => {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate('/auth/register')} className='ContinueGoogle'>
      <img src={src} width={size} height={size} />
      <p>{children}</p>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login({ email, password });
      login(response.access_token);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className='Login' onSubmit={handleSubmit}>
      <div className='LoginLeft'></div>
      <div className='LoginRight'>
        <p className='title'>Se connecter</p>
        <Input
          icon={null}
          name='email'
          type='email'
          holder='Saisissez votre adresse e-mail'
          value={email}
          onChange={setEmail}
        >
          E-mail
        </Input>
        <Input
          icon={null}
          name='password'
          type='password'
          holder='Saisissez votre mot de passe'
          value={password}
          onChange={setPassword}
        >
          Mot de passe
        </Input>

        {error && <p style={{ color: 'crimson', marginBottom: 12 }}>{error}</p>}

        <button type='submit' disabled={loading}>
          {loading ? 'Connexion...' : 'continuer'}
        </button>

        <LoginSeparator>ou</LoginSeparator>
        <SignUp size={20} src={account}>S'incrire</SignUp>
      </div>
    </form>
  );
};

export default Login;
