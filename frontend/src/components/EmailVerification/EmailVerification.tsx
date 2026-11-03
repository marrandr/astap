import './EmailVerification.css';
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import hamarinoLogo from '../../assets/hamarino-io-logo-2048x518.png';
import { clearPendingEmail, getPendingEmail, getStoredToken, useAuth } from '../../lib/auth';
import { useResendVerificationMutation, useVerifyEmailMutation } from '../../store/api';

function Brand({ mobile = false }: { mobile?: boolean }) {
  return (
    <Link to='/' className={`email-verification-brand${mobile ? ' email-verification-brand-mobile' : ''}`} aria-label='Hamarino.io, accueil'>
      <img src={hamarinoLogo} width={2048} height={518} alt='Hamarino.io' />
    </Link>
  );
}

export default function EmailVerification() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [verifyRequest, { isLoading: loading }] = useVerifyEmailMutation();
  const [resendRequest, { isLoading: resendLoading }] = useResendVerificationMutation();
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const pendingEmail = getPendingEmail();
    if (pendingEmail) {
      setEmail(pendingEmail);
      return;
    }

    const storedToken = getStoredToken();
    if (storedToken) {
      navigate('/', { replace: true });
      return;
    }

    navigate('/auth/login', { replace: true });
  }, [navigate]);

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!code) {
      setError('Veuillez renseigner le code à 6 chiffres.');
      return;
    }

    if (!email) {
      setError('Email introuvable. Veuillez recommencer la création du compte.');
      return;
    }

    try {
      const response = await verifyRequest({ email, code }).unwrap();
      if (response.access_token) {
        login(response.access_token);
      }
      clearPendingEmail();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code invalide');
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setError('');

    try {
      await resendRequest(email).unwrap();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de renvoyer le code');
    }
  };

  return (
    <main className='email-verification-page'>
      <section className='email-verification-story' aria-labelledby='email-verification-headline'>
        <Brand />
        <svg className='email-verification-watermark' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
          <path d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z' />
        </svg>
        <div className='email-verification-story-copy'>
          <h1 id='email-verification-headline'>Sécurisez votre accès,<br />vérifiez avant de publier.</h1>
          <p>Confirmez votre email pour activer votre compte et poursuivre les vérifications de sources en toute confiance.</p>
        </div>
      </section>

      <section className='email-verification-panel' aria-labelledby='email-verification-title'>
        <div className='email-verification-container'>
          <Brand mobile />
          <header className='email-verification-header'>
            <div className='email-verification-icon' aria-hidden='true'>
              <CheckCircle2 size={34} />
            </div>
            <h2 id='email-verification-title'>Validez votre adresse email</h2>
            <p>
              Un code à 6 chiffres a été envoyé à <strong>{email || 'votre adresse email'}</strong>.
            </p>
          </header>

          <form className='email-verification-form' onSubmit={handleVerify} aria-busy={loading}>
            <div className='email-verification-field'>
              <label htmlFor='email-verification-code'>Code de vérification <span>*</span></label>
              <div className='email-verification-input-wrap'>
                <CheckCircle2 size={18} aria-hidden='true' />
                <input
                  id='email-verification-code'
                  name='code'
                  type='text'
                  inputMode='numeric'
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder='123456'
                  autoFocus
                />
              </div>
            </div>

            {error && <p className='email-verification-error' role='alert'>{error}</p>}

            <button className='email-verification-submit' type='submit' disabled={loading}>
              <span>{loading ? 'Vérification…' : 'Vérifier mon email'}</span>
              {!loading && <ArrowRight size={18} aria-hidden='true' />}
            </button>

            <button className='email-verification-resend' type='button' onClick={handleResend} disabled={resendLoading}>
              <span>{resendLoading ? 'Envoi…' : 'Renvoyer le code'}</span>
              {!resendLoading && <RefreshCw size={16} aria-hidden='true' />}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
