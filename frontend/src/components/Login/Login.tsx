import './Login.css';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, AtSign, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import hamarinoLogo from '../../assets/hamarino-io-logo-2048x518.png';
import googleLogo from './Google.svg';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

function LoginBrand({ mobile = false }: { mobile?: boolean }) {
  return (
    <Link to='/' className={`login-brand${mobile ? ' login-brand-mobile' : ''}`} aria-label='Hamarino.io, accueil'>
      <img src={hamarinoLogo} alt='Hamarino.io' width={2048} height={518} />
    </Link>
  );
}

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Connexion — Hamarino.io';
    return () => { document.title = previousTitle; };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const response = await api.login({ email: email.trim(), password });
      login(response.access_token, remember);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='login-page'>
      <section className='login-story' aria-labelledby='login-headline'>
        <LoginBrand />
        <svg className='login-watermark' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
          <path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z' />
        </svg>
        <div className='login-story-copy'>
          <h1 id='login-headline'>Vérifiez avant de croire !</h1>
          <p>Donnez plus de force à vos enquêtes. Vérifiez les informations, documentez vos sources et contribuez à un journalisme plus fiable.</p>
        </div>
      </section>

      <section className='login-panel' aria-label='Connexion à Hamarino.io'>
        <div className='login-form-container'>
          <LoginBrand mobile />
          <form className='login-form' onSubmit={handleSubmit} aria-label='Se connecter' aria-busy={loading}>
            <div className='login-field'>
              <label htmlFor='login-email'>Adresse email <span className='login-required'>*</span></label>
              <div className='login-input-wrap'>
                <AtSign className='login-input-icon' size={18} aria-hidden='true' />
                <input id='login-email' name='email' type='email' autoComplete='username' placeholder='nom@exemple.mg' required value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
            </div>

            <div className='login-field'>
              <div className='login-label-row'>
                <label htmlFor='login-password'>Mot de passe <span className='login-required'>*</span></label>
                <button className='login-text-button' type='button' onClick={() => setNotice('La récupération du mot de passe n’est pas encore disponible.')}>Mot de passe oublié ?</button>
              </div>
              <div className='login-input-wrap'>
                <LockKeyhole className='login-input-icon' size={18} aria-hidden='true' />
                <input id='login-password' name='password' type={showPassword ? 'text' : 'password'} autoComplete='current-password' placeholder='••••••••••••' required value={password} onChange={(event) => setPassword(event.target.value)} />
                <button className='login-password-toggle' type='button' aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} aria-hidden='true' /> : <Eye size={18} aria-hidden='true' />}
                </button>
              </div>
            </div>

            <label className='login-remember'>
              <input name='remember' type='checkbox' checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <span>Se souvenir de moi pendant 30 jours</span>
            </label>

            {error && <p className='login-error' role='alert'>{error}</p>}

            <button className='login-submit' type='submit' disabled={loading}>
              <span>{loading ? 'Connexion…' : 'Se connecter'}</span>
              {!loading && <ArrowRight size={18} aria-hidden='true' />}
            </button>

            <div className='login-divider'><span>OU CONTINUER AVEC</span></div>

            <button className='login-google' type='button' onClick={() => setNotice('La connexion avec Google n’est pas encore disponible. Utilisez votre adresse email et votre mot de passe.')}>
              <img src={googleLogo} width={18} height={18} alt='' />
              <span>Continuer avec Google</span>
            </button>

            {notice && <p className='login-notice' role='status'>{notice}</p>}

            <p className='login-register'>Vous n’avez pas de compte ? <Link to='/auth/register'>S’inscrire</Link></p>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Login;
